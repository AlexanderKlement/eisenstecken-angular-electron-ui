import {Right} from "eisenstecken-openapi-angular-library";


export interface MenuTileDetail {
  title: string;
  image: string;
  link: string
}

export function matchRightsToMenuTiles(rights: Right[]): MenuTileDetail[] {
  const menuTileArray:MenuTileDetail[] = [];
  rights.forEach((right) => {
    switch(right.key) {
      case "jobs:all":
        menuTileArray.push({title:"Kunden", image:"001-shopping-cart.png", link:"/client"});
        return;
      case "calendar:all":
        menuTileArray.push({title:"Job", image:"001-shopping-cart.png", link:"/"});
        return;
      case "supplier:all":
        menuTileArray.push({title:"Job", image:"001-shopping-cart.png", link:"/"});
        return;
      case "ingoing_invoices:all":
      case "outgoing_invoices:all":
        menuTileArray.push({title:"Job", image:"001-shopping-cart.png", link:"/"});
        return;
      case "clients:all":
        menuTileArray.push({title:"Job", image:"001-shopping-cart.png", link:"/"});
        return;
      case "articles:all":
        menuTileArray.push({title:"Job", image:"001-shopping-cart.png", link:"/"});
        return;
    }
  });
  return menuTileArray;
}
