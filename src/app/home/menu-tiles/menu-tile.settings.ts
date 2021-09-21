import {Right} from 'eisenstecken-openapi-angular-library';


export interface MenuTileDetail {
    title: string;
    icon: string;
    link: string;
}

export function matchRightsToMenuTiles(rights: Right[]): MenuTileDetail[] {
    const menuTileArray: MenuTileDetail[] = [];
    rights.forEach((right) => {
        switch (right.key) {
            case 'clients:all':
                menuTileArray.push({title: 'Kunden', icon: 'group', link: '/client'});
                return;
            case 'jobs:all':
                menuTileArray.push({title: 'Auftrag', icon: 'domain', link: '/job'});
                return;
            case 'users:all':
                menuTileArray.push({title: 'Benutzer', icon: 'person', link: '/user'});
                return;
            case 'orders:all':
                menuTileArray.push({title: 'Bestellungen', icon: 'local_grocery_store', link: '/order'});
                return;
            case 'ingoing_invoices:all':
            case 'outgoing_invoices:all':
                menuTileArray.push({title: 'Rechnungen', icon: 'money', link: '/invoice'});
                return;
            case 'parameters:set':
                menuTileArray.push({title: 'Einstellungen', icon: 'settings', link: '/settings'});
                return;
            case 'suppliers:all':
                menuTileArray.push({title: 'Lieferanten', icon: 'local_shipping', link: '/supplier'});
                return;
            case 'hours:insert':
                menuTileArray.push({title: 'Arbeitstag', icon: 'schedule', link: '/work_days'});
        }
    });
    // TODO: remove duplicates;
    return menuTileArray;
}
