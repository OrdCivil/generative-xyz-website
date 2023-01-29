import { ROUTE_PATH } from '@constants/route-path';
import { SOCIALS } from '@constants/common';

export const MENU_HEADER = [
  {
    id: 'menu-4',
    name: 'Display',
    route: ROUTE_PATH.DISPLAY,
    activePath: 'display',
  },
  {
    id: 'menu-1',
    name: 'Create',
    route: ROUTE_PATH.BENEFIT,
    activePath: 'benefit',
  },
  {
    id: 'menu-2',
    name: 'Collect',
    route: ROUTE_PATH.MARKETPLACE,
    activePath: 'marketplace',
  },
];

export const RIGHT_MENU = [
  {
    id: 'menu-5',
    name: 'Docs',
    route: SOCIALS.docs,
    activePath: 'docs',
  },
  {
    id: 'menu-6',
    name: 'DisCord',
    route: SOCIALS.discord,
    activePath: 'discord',
  },
];

export const MENU_MOBILE = [...MENU_HEADER, ...RIGHT_MENU];