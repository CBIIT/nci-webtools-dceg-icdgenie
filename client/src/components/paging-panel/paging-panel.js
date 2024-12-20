import { withComponents } from '@devexpress/dx-react-core';
import { PagingPanel as PagingPanelBase } from '@devexpress/dx-react-grid';
import { Pager as Container } from './pager';

export const PagingPanel = withComponents({ Container })(PagingPanelBase);