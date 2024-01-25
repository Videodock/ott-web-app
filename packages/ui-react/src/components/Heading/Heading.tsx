import React from 'react';

type Props = React.HTMLAttributes<HTMLHeadingElement> & { headingNumber: number };

const Heading: React.FC<Props> = ({ headingNumber, ...rest }) => {
  switch (headingNumber) {
    case 1:
      return <h1 {...rest} />;
    case 2:
      return <h2 {...rest} />;
    case 3:
      return <h3 {...rest} />;
    case 4:
      return <h4 {...rest} />;
    case 5:
      return <h5 {...rest} />;
    case 6:
      return <h6 {...rest} />;
    default:
      return <h2 />;
  }
};

export default Heading;
