import {Right} from 'eisenstecken-openapi-angular-library';
import {containsRight} from '../../shared/services/auth.service';


export interface MenuTileDetail {
    title: string;
    icon: string;
    link: string;
    requiredRights: string[];
}

export const availableMenuTiles: MenuTileDetail[] = [
    {title: 'Kunden', icon: 'group', link: '/client', requiredRights: ['clients:all']},
    {title: 'Aufträge', icon: 'domain', link: '/job', requiredRights: ['jobs:all']},
    {title: 'Nachkalkulation', icon: 'calculate', link: '/recalculation', requiredRights: ['recalculations:all']},
    {title: 'Bestellungen', icon: 'local_grocery_store', link: '/order', requiredRights: ['orders:all']},
    {title: 'Lieferanten', icon: 'local_shipping', link: '/supplier', requiredRights: ['suppliers:all', 'stocks:all']},
    {title: 'Lieferscheine', icon: 'assignment', link: '/delivery_note', requiredRights: ['delivery_notes:all']},
    {
        title: 'Rechnungen',
        icon: 'money',
        link: '/invoice',
        requiredRights: ['ingoing_invoices:all', 'outgoing_invoices:all']
    },
    {title: 'Stundenzettel', icon: 'work', link: '/employee', requiredRights: ['hours:modify']},
    {title: 'Benutzer', icon: 'person', link: '/user', requiredRights: ['users:all']},
    {title: 'Einstellungen', icon: 'settings', link: '/settings', requiredRights: ['parameters:set']},
    {title: 'Arbeitstag', icon: 'schedule', link: '/work_day', requiredRights: ['nobody:hours:insert']},
];

export function matchRightsToMenuTiles(rights: Right[]): MenuTileDetail[] {
    const menuTileArray: MenuTileDetail[] = [];
    for (const availableMenuTile of availableMenuTiles) {
        for (const requiredRight of availableMenuTile.requiredRights) {
            if (containsRight(requiredRight, rights)) {
                menuTileArray.push(availableMenuTile);
                break;
            }
        }
    }
    return menuTileArray;
}


