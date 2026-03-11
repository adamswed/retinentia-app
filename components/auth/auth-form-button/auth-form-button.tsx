import React from 'react';
import style from './auth-form-button.module.scss';
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
interface Props {
  disabled: boolean;
  loading: boolean;
  children: React.ReactNode;
}
const AuthFormButton: React.FC<Props> = ({ children, disabled, loading }) => (
  <button
    disabled={disabled || loading}
    type='submit'
    className={style.auth_form_button}
  >
    {loading ? <LoadingSpinner /> : children}
  </button>
);

export default AuthFormButton;
