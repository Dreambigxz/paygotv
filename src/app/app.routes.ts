import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { UserComponent } from './user/user.component';
import {LoginComponent} from './authentication/login.component'
import {RegisterComponent} from './authentication/register.component'
import {ForgotPasswordComponent} from './authentication/forgot-password/forgot-password.component'
import { MainComponent } from "./main/main.component";

import { UserPackageComponent } from "./user-package/user-package.component";

import { WalletComponent } from "./wallet/wallet.component";
import { TeamsComponent } from "./teams/teams.component";
import { TeamDetailsComponent } from "./teams/team-details/team-details.component";
import { ProfileComponent } from "./profile/profile.component";
import { NotificationPageComponent } from "./notification-page/notification-page.component";
import { AboutComponent } from "./about/about.component";
import { PaymentConfirmationComponent } from "./payment-confirmation/payment-confirmation.component";
import { InviteRewardComponent } from "./invite-reward/invite-reward.component";

import { authGuard } from './reuseables/auth/auth.guard';

export const routes: Routes = [

  // {
  //   path: '',
  //   component: HomeComponent,
  //   title: 'EFGX',
  //
  // },

  {
    path: 'main',
    component: MainComponent,
    title: 'Dashboard',
    canActivate: [authGuard],

  },

  {
    component: UserPackageComponent,
    title: 'My-Packages',
    canActivate: [authGuard],
    path: 'packages',

  },


  {
    component: WalletComponent,
    title: 'wallet',
    canActivate: [authGuard],
    path: 'wallet/:action',

  },

  {
    component: TeamsComponent,
    title: 'Teams',
    canActivate: [authGuard],
    path: 'teams',

  },

  {
    component: TeamDetailsComponent,
    title: 'Team-Details',
    canActivate: [authGuard],
    path: 'team-detail/:level/:comm',

  },

  {
    component: ProfileComponent,
    title: 'Profile',
    canActivate: [authGuard],
    path: 'profile',

  },
  {
    component: InviteRewardComponent,
    title: 'Invite Reward',
    canActivate: [authGuard],
    path: 'invite-rewards',

  },

  {
    component: NotificationPageComponent,
    title: 'Notifications',
    canActivate: [authGuard],
    path: 'notification',

  },

  {
      component: AboutComponent,
      title: 'About us',
      // canActivate: [authGuard],
      path: 'about',

    },

  {
      component: PaymentConfirmationComponent,
      title: 'CONFIRMATION',
      canActivate: [authGuard],
      path: 'confirmation',

    },

  { path:"login",  component: LoginComponent, title:'Authentication'},
  { path:"register",  component: RegisterComponent, title:'Authentication'},
  { path:"forgot-password",  component: ForgotPasswordComponent,title:'Authentication'},

  {
    path: '**',
    // component: AppComponent,
    // title: 'App',
    redirectTo:'main',
    pathMatch:'full'

  },
];
