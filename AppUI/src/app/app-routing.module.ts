import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from '../main/main.component';
import { GraphsComponent }  from '../graphs/graphs.component';
import {HomeComponent} from './home/home.component';
import { CostComponent } from './cost/cost.component';
const routes: Routes = [{
  path:'',component: MainComponent,
  children:[
    {
      path: 'graphs',
      component: GraphsComponent
    },
    {
      path: 'home',
      component: HomeComponent
    },
    {
      path:'cost',
      component:CostComponent
    },
    {
      path: '',
      pathMatch: 'full',
      redirectTo: '/home',
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
