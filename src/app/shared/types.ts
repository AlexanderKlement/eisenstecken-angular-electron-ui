import {
    Article,
    Calendar,
    Client,
    IngoingInvoice,
    Job,
    Offer,
    OutgoingInvoice,
    User
} from 'eisenstecken-openapi-angular-library';

export type DataSourceClass = Client | User | Calendar | Job | Offer | Article | OutgoingInvoice | IngoingInvoice;

export type RecursiveKeyOf<T, Prefix extends string = never> =
  T extends string | number | bigint | boolean
  | null | undefined | ((...args: any) => any) ? never : {
      [K in keyof T & string]: [Prefix] extends [never]
        ? K | `['${K}']` | RecursiveKeyOf<T[K], K>
        : `${Prefix}.${K}` | `${Prefix}['${K}']` | RecursiveKeyOf<T[K], `${Prefix}.${K}` | `${Prefix}['${K}']`>
    }[keyof T & string];

//I did not come up with this myself: https://stackoverflow.com/questions/65332597/typescript-is-there-a-recursive-keyof
