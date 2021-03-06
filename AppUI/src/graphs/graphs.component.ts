import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import { Chart } from 'angular-highcharts';
import ForceGraph3D from '3d-force-graph';
import { dummyjson, realjson } from '../json/miserables';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AnalyticsService} from '../app/services/analytics.service';
import {MatSnackBar} from '@angular/material/snack-bar';
@Component({
    selector:'graphs',
    templateUrl:'./graphs.component.html',
    styleUrls:['./graphs.component.scss']
})
export class GraphsComponent implements OnInit{

    cloudPerf = new FormGroup({
        category: new FormControl(''),
        function: new FormControl(''),
        cloud: new FormControl(''),
        queries: new FormArray([
        ])
    })
    @ViewChild('child',{static:true})child: ElementRef;
    highChartsOptions =
    {
        chart: {
            renderTo: 'container',
            type: 'column',
            height:'30%',
            options3d: {
                enabled: true,
                alpha: 15,
                beta: 15,
                depth: 50,
                viewDistance: 25
            }
        },
        title: {
            text: 'Function Performance Comparison'
        },
        subtitle: {
            text: 'AZURE VS AWS'
        },
        plotOptions: {
            column: {
                depth: 50,
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        xAxis: {
            categories: [

            ]
        },
        yAxis: {
          title: undefined
        },
        series: [{
            name: 'AWS',
            data: [],
            type: undefined
        },
        {
            name: 'AZURE',
            data: [],
            type: undefined
        }
    ]
    };
  chart: Chart ;

  categories = [];
  functions = [];
  queries = [];
  clouds = ['AWS', 'Azure', 'GCP'];
  sampleData;

  sampleCats = { Analytics : []};

  constructor(private analyticsService: AnalyticsService, private formBuilder: FormBuilder,private _snackBar: MatSnackBar){

  }

  ngOnInit() {
    this.analyticsService.getAnalytics().subscribe( (data) => {
      this.sampleCats.Analytics = data;
      this.renderFrom();
    },(error)=>{
      this.openSnackBar("Some error occurred");
    });
    this.analyticsService.getTimes().subscribe( (data) => {
      this.sampleData = data;
      this.renderGraph();
    },(error)=>{
      this.openSnackBar("Some error occurred");
    });
  }

  renderGraph() {
   
    this.highChartsOptions.xAxis.categories=[];
    this.highChartsOptions.series[0].data=[];
    this.highChartsOptions.series[1].data=[];
    Object.keys(this.sampleData).forEach((element) => {
      this.highChartsOptions.xAxis.categories.push(element);
      this.highChartsOptions.series[0].data.push(this.sampleData[element]["awsvalue"])
      this.highChartsOptions.series[1].data.push(this.sampleData[element]["azurevalue"])
    });
    this.chart = new Chart(this.highChartsOptions);
  }

  renderFrom() {

    this.categories = this.sampleCats.Analytics.map(cat => cat.category);

    this.cloudPerf.get('category').valueChanges.subscribe(
        val =>{
            this.functions = this.getFunctions(val);
        }
    )

    this.cloudPerf.get('function').valueChanges.subscribe(
      val =>{
         this.queries = this.getQueries(val);
         this.cloudPerf.setControl('queries', this.formBuilder.array([]));
         this.queries.forEach(q => {
          (this.cloudPerf.get('queries') as FormArray).push(
          new FormControl(`${q}`)
          );
         }
         )
         console.log(this.cloudPerf.get('queries').value);
        
    }
  );

   // this.myGraph = ForceGraph3D()(this.child.nativeElement).graphData(dummyjson);
  }

  getFunctions(val: any ){
    let filteredCat =  this.sampleCats.Analytics.filter(cat => cat.category == val);
    return filteredCat[0]["functions"]
  }

  getQueries(val:any) {
    let filteredCat =  this.sampleCats["Analytics"].filter(cat => cat.category == this.cloudPerf.get('category').value);
    let queries = filteredCat[0]["functions"].filter(func=> func.functionName == val)[0]["query"]; 
    return queries;
  }

  onSubmit(value: any) {
    console.log(value);

    this.analyticsService.runAnalytics(value).subscribe((data) => {
      console.log(data);
    },(error)=>{
      this.openSnackBar("Some error occurred");
    });
  }

  refreshGraph(){
    this.analyticsService.getTimes().subscribe( (data) => {
      this.sampleData = data;
      this.renderGraph();
    },(error)=>{
      this.openSnackBar("Some error occurred");
    });
  }

  runAll() {
    this.analyticsService.runAll().subscribe((data) => {
      console.log(data);
      this.openSnackBar("All functions ran successfully");
    },(error)=>{
      this.openSnackBar("Some error occurred");
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message,null, {
      duration: 2000,
    });
  }
}
