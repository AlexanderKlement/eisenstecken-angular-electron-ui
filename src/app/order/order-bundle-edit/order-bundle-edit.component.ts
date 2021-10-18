import {Component, OnInit} from '@angular/core';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {
    DefaultService,
    Lock,
    OrderedArticlePriceUpdate,
    Order,
    OrderBundle
} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {first, tap} from 'rxjs/operators';
import {Form, FormArray, FormControl, FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfirmDialogComponent} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-order-bundle-edit',
    templateUrl: './order-bundle-edit.component.html',
    styleUrls: ['./order-bundle-edit.component.scss']
})
export class OrderBundleEditComponent extends BaseEditComponent<OrderBundle> implements OnInit {

    orderBundleId: number;
    navigationTarget = 'supplier';
    orderBundleGroup: FormGroup;

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog, private snackbar: MatSnackBar) {
        super(api, router, route, dialog);
    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> => api.islockedOrderBundleOrderBundleIslockedOrderBundleIdGet(id);

    dataFunction = (api: DefaultService, id: number): Observable<OrderBundle> => api.readOrderBundleOrderBundleOrderBundleIdGet(id);

    unlockFunction = (api: DefaultService, id: number): Observable<boolean> => api.unlockOrderBundleOrderBundleUnlockOrderBundleIdPost(id);

    ngOnInit(): void {
        super.ngOnInit();
        this.initOrderBundleGroup();
        this.routeParams.subscribe((params) => {
            this.orderBundleId = parseInt(params.id, 10);
            if (isNaN(this.orderBundleId)) {
                console.error('OrderBundleEdit: Cannot determine id');
                this.router.navigateByUrl(this.navigationTarget);
            }
            this.navigationTarget = 'job/' + this.orderBundleId.toString();
            this.loadOrders();
        });

    }

    loadOrders(): void {
        console.log('load orders');
        this.api.readOrdersByOrderBundleOrderBundleOrdersOrderBundleIdGet(this.orderBundleId).pipe(first()).subscribe(orders => {
            console.log(orders);
            for (const order of orders) {
                this.getOrderFormArray().push(this.initOrder(order));
            }
        });
    }

    initOrderBundleGroup() {
        this.orderBundleGroup = new FormGroup({
            orders: new FormArray([])
        });
    }

    getOrderFormArray(): FormArray {
        return this.orderBundleGroup.get('orders') as FormArray;
    }

    getArticlesAt(index: number): FormArray {
        return this.getOrderFormArray().at(index).get('articles') as FormArray;
    }

    initOrder(order: Order): FormGroup {
        const articleFormArray = new FormArray([]);
        for (const article of order.articles) {
            articleFormArray.push(new FormGroup({
                id: new FormControl(article.id),
                name: new FormControl(article.article.name.translation_de),
                amount: new FormControl(article.amount),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                mod_number: new FormControl(article.article.mod_number),
                unit: new FormControl(article.ordered_unit.name.translation_de),
                price: new FormControl(article.price)
            }));
        }

        return new FormGroup({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            order_from: new FormControl(order.order_from.displayable_name),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            order_to: new FormControl(order.order_to.displayable_name),
            articles: articleFormArray,
        });
    }

    onSubmit(): void {
        const priceUpdate: OrderedArticlePriceUpdate[] = [];
        for (const order of this.getOrderFormArray().controls) {
            for (const article of (order.get('articles') as FormArray).controls) {
                priceUpdate.push({
                    id: parseInt(article.get('id').value, 10),
                    price: parseFloat(article.get('price').value),
                });
            }
        }
        this.api.updateOrderedArticlePriceOrderedArticlePricePut(priceUpdate).pipe(first()).subscribe(result => {
            if (result) {
                this.router.navigateByUrl('order_bundle/' + this.orderBundleId.toString());
            } else {
                console.error('OrderBundleEdit: Could not update all prices');
            }
        });
    }

    onRemoveArticleClick(i: number, j: number): void {
        const articles = this.getArticlesAt(i);
        const article = articles.at(j);
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Artikel löschen?',
                text: 'Dieser Schritt kann nicht rückgängig gemacht werden.'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.api.deleteOrderedArticleOrderedArticleOrderedArticleIdDelete(article.get('id').value).pipe(first())
                    .subscribe(success => {
                        if (success) {
                            articles.removeAt(j);
                        } else {
                            this.snackbar.open('Der Artikel konnte leider nicht gelöscht werden. Bitte probieren sie es später erneut'
                                , 'Ok',{
                                duration: 10000
                              });
                        }
                    });
            }
        });
    }

    protected observableReady() {
        super.observableReady();
    }


}
