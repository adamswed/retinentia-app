import { Metadata } from 'next';
import { NO_INDEX_METADATA } from '@/lib/constants';
import DeleteUserAccountClient from './delete-user-account-client';
export const metadata: Metadata = {
  title: 'Delete your User Account | Retinentia',
  ...NO_INDEX_METADATA,
};
const DeleteUserAccount = () => {
  return <DeleteUserAccountClient />;
};
export default DeleteUserAccount;
