import React, { FC } from 'react';

import { container } from './container';

const InjectableComponent = <Props extends object>(identifier: symbol, props: Props, DefaultComponent: FC<Props>) => {
  const isOverridden = container.isBound(identifier);

  if (isOverridden) {
    const OverriddenComponent = container.get<React.FC<Props>>(identifier);

    return <OverriddenComponent {...props} />;
  }

  return <DefaultComponent {...props} />;
};

export default InjectableComponent;
