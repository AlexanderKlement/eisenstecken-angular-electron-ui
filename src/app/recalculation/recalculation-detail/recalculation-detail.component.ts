import {Component, OnInit} from '@angular/core';
import {DefaultService, Recalculation} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';


@Component({
    selector: 'app-recalculation-detail',
    templateUrl: './recalculation-detail.component.html',
    styleUrls: ['./recalculation-detail.component.scss']
})
export class RecalculationDetailComponent implements OnInit {

    jobId: number;
    loading = true;
    recalculation: Recalculation;

    constructor(private api: DefaultService, private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.jobId = parseInt(params.id, 10);
            if (isNaN(this.jobId)) {
                console.error('RecalculationDetail: Cannot parse jobId');
                this.router.navigateByUrl('recalculation');
                return;
            }
            this.api.readCalculationByJobRecalculationJobJobIdGet(this.jobId).pipe().subscribe(recalculation => {
                if (recalculation === undefined || recalculation === null) {
                    this.router.navigateByUrl('recalculation/edit/new/' + this.jobId.toString());
                    return;
                }
                this.recalculation = recalculation;
                this.initRecalculation();
                this.loading = false;
            });
        });
    }

    initRecalculation(): void {

    }

}
