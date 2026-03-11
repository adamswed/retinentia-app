import { Metadata } from 'next';
import { NO_INDEX_METADATA } from '@/lib/constants';
import UpdatePasswordClient from './update-password-client';
export const metadata: Metadata = {
  title: 'Update your Password | Retinentia',
  ...NO_INDEX_METADATA,
};
const UpdatePassword = () => {
  return <UpdatePasswordClient />;
};
export default UpdatePassword;
