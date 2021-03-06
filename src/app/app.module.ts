import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
//import {Inject, ViewChild} from 'angular2/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HttpClientModule } from '@angular/common/http';

import { App } from 'ionic-angular';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { FeedPage } from '../pages/feed/feed';
import { CommentsPage } from '../pages/comments/comments';
import { CodesignPage } from '../pages/codesign/codesign';
import { ConfigurePage } from '../pages/configure/configure';
import { PasswordresetPage } from '../pages/passwordreset/passwordreset';

import { Camera } from '@ionic-native/camera';
import { Firebase } from '@ionic-native/firebase';

import firebase from 'firebase';
import { config } from './app.firebaseconfig';

import { UserProvider } from '../providers/user/user';
import { KatexDirective } from '../directives/katex/katex'

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { AppVersion } from '@ionic-native/app-version';
import { UpdaterPage } from '../pages/updater/updater';
import { PopoverController } from 'ionic-angular';

import { Autosize } from '../components/autosize';
import { PopupsProvider } from '../providers/popups/popups';

import { PhotoViewer } from '@ionic-native/photo-viewer';
import { KatexModule } from 'ng-katex';

firebase.initializeApp(config);

firebase.firestore().settings({
  timestampsInSnapshots: true
})

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignupPage,
    FeedPage,
    CommentsPage,
    UpdaterPage,
    CodesignPage,
    Autosize,
    ConfigurePage,
    PasswordresetPage,
    KatexDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(config),
    AngularFirestoreModule,
    KatexModule
    //AngularFireModule

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignupPage,
    FeedPage,
    CommentsPage,
    UpdaterPage,
    CodesignPage,
    ConfigurePage,
    PasswordresetPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    Firebase,
    AngularFireAuth,
    AppVersion,
    PopoverController,
    PhotoViewer,
    //ConfigurePage,
//    NavController,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserProvider,
    PopupsProvider,
  ]
})
export class AppModule {}
