import '@/styles/auth-style.css';
import GoBackButton from '@/components/shared/go-back-home/go-back-home';
import { Metadata } from 'next';
import { NO_INDEX_METADATA } from '@/lib/constants';
export const metadata: Metadata = {
  title: 'User Account | Retinentia',
  ...NO_INDEX_METADATA,
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoBackButton />
      <div className='card_container'>
        <div className='card_wrapper'>{children}</div>
      </div>
    </>
  );
}
