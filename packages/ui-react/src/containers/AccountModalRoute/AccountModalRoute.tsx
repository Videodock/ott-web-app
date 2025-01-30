import React from 'react';

export type ModalRouteProps = {
  param: string;
  element: React.ReactNode;
  isPublic?: boolean;
  size?: 'small' | 'large';
  hideBanner?: boolean;
};

const AccountModalRoute = ({ element }: ModalRouteProps) => {
  return element;
};

export default AccountModalRoute;
