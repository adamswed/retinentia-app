import { Metadata } from 'next';
import { NO_INDEX_METADATA } from '@/lib/constants';
import UserAccountClient from './user-account-client';
export const metadata: Metadata = {
  title: 'User Account | Retinentia',
  ...NO_INDEX_METADATA,
};
const UserAccount = () => {
  return <UserAccountClient />;
};

export default UserAccount;
