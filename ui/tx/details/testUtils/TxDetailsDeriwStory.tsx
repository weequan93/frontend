import React from 'react';

import * as DetailedInfo from 'ui/shared/DetailedInfo/DetailedInfo';

import TxDetailsDeriw from '../TxDetailsDeriw';

const TxDetailsDeriwStory = (props: React.ComponentProps<typeof TxDetailsDeriw>) => (
  <DetailedInfo.Container><TxDetailsDeriw { ...props }/></DetailedInfo.Container>
);

export default TxDetailsDeriwStory;
