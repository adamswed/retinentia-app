'use server';
import { Redis } from '@upstash/redis';

// Initialize Redis client (only if environment variables are set)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const ENV = process.env.NODE_ENV || 'development';
const REDIS_KEY = `wikimedia:access_token:${ENV}`;
const REDIS_LOCK_KEY = `wikimedia:access_token:lock:${ENV}`;
const LOCK_TTL = 10; // seconds - maximum time to hold the lock

/**
 * Retrieves a Wikimedia OAuth access token using client credentials flow.
 * Caches the token in Redis and reuses it until 60 seconds before expiry.
 * Falls back to fetching a new token on every request if Redis is not configured.
 *
 * @returns The access token, or null if authentication fails
 */
export const getAccessToken = async (): Promise<string | null> => {
  const currentTime = Date.now();

  // Try to get cached token from Redis
  if (redis) {
    try {
      const cached = await redis.get<{
        token: string;
        expiresAt: number;
      }>(REDIS_KEY);

      if (cached) {
        if (cached.expiresAt > currentTime + 60000) {
          return cached.token;
        } else {
          console.warn(
            'Cached token expires too soon (< 60s), fetching new one...',
          );
        }
      } else {
        console.error('No cached token found in Redis');
        // Check if key exists at all
        const exists = await redis.exists(REDIS_KEY);
        console.error('- Key exists check:', exists);
      }
    } catch (error) {
      console.error('Redis GET error:', error);
      console.error('- Error type:', error?.constructor?.name);
    }
  } else {
    console.warn('Redis not configured - skipping cache check');
  }

  // Token not found or expired - need to fetch new one
  // Use Redis lock to prevent multiple instances from fetching simultaneously
  let lockAcquired = false;

  if (redis) {
    try {
      // Try to set lock with NX (only if not exists) and EX (expiry)
      lockAcquired =
        (await redis.set(REDIS_LOCK_KEY, '1', {
          nx: true, // Only set if key doesn't exist
          ex: LOCK_TTL, // Expire after LOCK_TTL seconds
        })) === 'OK';

      if (!lockAcquired) {
        // Another instance is fetching the token
        console.error('Lock held by another instance, waiting...');

        // Wait a bit and check if token was cached by the other instance
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const cachedAfterWait = await redis.get<{
          token: string;
          expiresAt: number;
        }>(REDIS_KEY);

        if (cachedAfterWait && cachedAfterWait.expiresAt > Date.now() + 60000) {
          console.warn('Token was cached by another instance while waiting');
          return cachedAfterWait.token;
        }

        console.warn('No token after waiting, proceeding to fetch anyway...');
      } else {
        console.warn('Lock acquired');
      }
    } catch (error) {
      console.error('Lock error:', error);
    }
  }

  const clientId = process.env.WIKIMEDIA_CLIENT_ID;
  const clientSecret = process.env.WIKIMEDIA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('WIKIMEDIA_CLIENT_ID or WIKIMEDIA_CLIENT_SECRET not set.');
    return null;
  }

  // Base64 encoding for Basic Auth header
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64',
  );
  try {
    const tokenResponse = await fetch(
      'https://meta.wikimedia.org/w/rest.php/oauth2/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authString}`,
          'User-Agent':
            'Retinentia/1.0 (https://retinentia.com/; support@retinentia.com)',
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store',
      },
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(
        'Failed to get access token:',
        tokenResponse.status,
        errorText,
      );
      return null;
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      expires_in: number; // typically 3600 seconds (1 hour)
    };

    const expiresAt = currentTime + tokenData.expires_in * 1000;
    // Cache the new token in Redis
    if (redis) {
      try {
        await redis.set(
          REDIS_KEY,
          {
            token: tokenData.access_token,
            expiresAt: expiresAt,
          },
          {
            ex: tokenData.expires_in,
          },
        );
        // Immediately verify the SET worked
        const verification = await redis.get<{
          token: string;
          expiresAt: number;
        }>(REDIS_KEY);
        if (!verification) {
          console.error(
            'VERIFICATION FAILED: Key NOT found immediately after SET!',
          );
        }
      } catch (error) {
        console.error('Redis operation error:', error);
        console.error('- Error type:', (error as unknown)?.constructor?.name);
        console.error('- Error message:', (error as Error)?.message);
        console.error('- Full error:', JSON.stringify(error, null, 2));
      }
    } else {
      console.warn('Redis not configured - token NOT cached!');
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Error during access token request:', error);
    return null;
  } finally {
    // Always release the lock if we acquired it
    if (redis && lockAcquired) {
      try {
        await redis.del(REDIS_LOCK_KEY);
        console.warn('Lock released');
      } catch (lockError) {
        console.error('Failed to release lock:', lockError);
      }
    }
  }
};
