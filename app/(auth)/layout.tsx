import '@/styles/auth-style.css';
import GoBackButton from '@/components/shared/go-back-home/go-back-home';
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
