import {Right} from 'eisenstecken-openapi-angular-library';


export interface MenuTileDetail {
    title: string;
    image: string;
    link: string;
}

export function matchRightsToMenuTiles(rights: Right[]): MenuTileDetail[] {
    const menuTileArray: MenuTileDetail[] = [];
    rights.forEach((right) => {
        switch (right.key) {
            case 'clients:all':
                menuTileArray.push({title: 'Kunden', image: '001-shopping-cart.png', link: '/client'});
                return;
            case 'jobs:all':
                menuTileArray.push({title: 'Auftrag', image: '001-shopping-cart.png', link: '/job'});
                return;
            case 'users:all':
                menuTileArray.push({title: 'Benutzer', image: '001-shopping-cart.png', link: '/user'});
                return;
            case 'orders:all':
                menuTileArray.push({title: 'Bestellungen', image: '001-shopping-cart.png', link: '/order'});
                return;
            case 'ingoing_invoices:all':
            case 'outgoing_invoices:all':
                menuTileArray.push({title: 'Rechnungen', image: '001-shopping-cart.png', link: '/invoice'});
                return;
            case 'articles:all':
                menuTileArray.push({title: 'Nothing', image: '001-shopping-cart.png', link: '/'});
                return;
            case 'parameters:set':
                menuTileArray.push({title: 'Einstellungen', image: '044-settings.png', link: '/settings'});
                return;
            case 'suppliers:all':
                menuTileArray.push({title: 'Lieferanten', image: '044-settings.png', link: '/supplier'});
        }
    });
    return menuTileArray;
}
