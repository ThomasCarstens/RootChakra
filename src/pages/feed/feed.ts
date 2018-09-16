import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, ActionSheetController, AlertController, ModalController, Modal } from 'ionic-angular';
import firebase from 'firebase';
import moment from 'moment';
import { LoginPage } from '../login/login';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HttpClient } from '@angular/common/http';
import { CommentsPage } from '../comments/comments';
import { CodesignPage } from '../codesign/codesign';
import { Firebase } from '@ionic-native/firebase';


//import * as admin from 'firebase-admin';
//import { UserProvider } from '../../providers/user/user';

@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {
 dummyText: string = `Type a longer text to see how this expands!`;
  text: string = "";
  posts: any[] = [];
  pageSize: number = 10;
  cursor: any;
  infiniteEvent: any;
  image: string;
  StudentType:string;
  StudentNumber:string;
  user: any[] = [];
  idea: string;
  latestsurvey: string='2';
  popuprecord: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private camera: Camera,
              private http: HttpClient,
              private actionSheetCtrl: ActionSheetController,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private firebaseCordova: Firebase,
              //public userservice: UserProvider,
            ) {
    //testing for displayname: the following works
    //console.log(firebase.auth().currentUser.displayName)
    //var currentuser = firebase.auth().currentUser;
    //if (currentuser!= null) {
    //  currentuser.providerData.forEach(function (profile) {
    //    console.log('Name:'+profile.displayName)
    //  })
    //}

    this.firebaseCordova.getToken().then(async (token) => {
      console.log(token)

      await this.updateToken(token, firebase.auth().currentUser.uid);
      console.log(token)
    }).catch((err) => {
      console.log(err)
    })

    //CHECK USER POPUPRECORD vs LATESTSURVEY both on firestore.
firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).get().then(async(user) => {
  //await user.data().survey_value;
  this.popuprecord = user.data().survey_value || "none";
}).catch(err => {
  console.log(err);
})

firebase.firestore().collection("settings").doc("surveys").get().then(async(user) => {
  //await user.data().survey_value;
  this.latestsurvey = user.data().latestsurvey || "none";
}).catch(err => {
  console.log(err);
})

this.getPosts();

//timeout for firestore retrieval time.
setTimeout(() => {
this.popup();
}, 3000);



  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad CodesignPage');
  }

////////////////////////////FUNCTIONS///////////////////////////


//////////////////////////Check if popups are triggered.
  popup(){

  console.log('Latest Survey:', this.latestsurvey);
  console.log('Last Survey by', firebase.auth().currentUser.displayName, ':', this.popuprecord);

    if(this.popuprecord !== this.latestsurvey) {
        this.OnceOffBasicAlert();  //only happens once.
        //this.popuprecord = this.latestsurvey;  happens in alertcontroller
      } else {
//        nothing yet, regular user.
        console.log('do not ask', firebase.auth().currentUser.displayName, 'twice.')
      }
      //SET UP VARIABLE ON STORE

  }



//this.NewFeatures();

gotoCodesign(){
  this.navCtrl.setRoot(CodesignPage);
}

  askkindly(){

  let alert = this.alertCtrl.create({
    title: 'Collaborative Feedback Project',
    subTitle: 'As part of his project, Thomas is required to hear your opinion on the app- and about the course.',
    buttons: [{
    text: 'Codesign',
    handler: () => {
      // user has clicked the alert button
      // begin the alert's dismiss transition
      let navTransition = alert.dismiss();

      // start some async method
      this.navCtrl.setRoot(CodesignPage).then(() => {
        // once the async operation has completed
        // then run the next nav transition after the
        // first transition has finished animating out

        navTransition.then(() => {
          this.navCtrl.pop();
        });
      });
      return false;
    }
  }],
    enableBackdropDismiss: false
  });
  alert.present();

  }

  OnceOffBasicAlert(){
  let alert = this.alertCtrl.create({
    title: 'New Features',
    subTitle: 'VERSION 3.0 - Smooth comment sections - can add pics in comments! Also click the bonfire logo above to contribute to a discussion about the app and ultimately about the course.',
    inputs: [
      {
        type: 'checkbox',
        label: 'don\'t ask me again',
        handler:(e)=>{
          // e.checked is the checkbox value (true or false)
           console.info('value: ',e.checked)
//IF TRUE IF FALSE TO BE ADDED.
           this.popuprecord = this.latestsurvey;
           console.log('Asked kindly, now Last Survey by', firebase.auth().currentUser.displayName, 'to be set to', this.popuprecord);
        }
      }
    ],
    buttons: [{
    text: 'Ok',
    handler: () => {

    firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).set({
    survey_value: this.popuprecord,
    }, {
    merge: true
    }).then(() => {
    console.log('RESET: Last Survey by', firebase.auth().currentUser.displayName, ':', this.popuprecord);
    }).catch(err => {
    console.log(err);
  });
}
}] //BUTTON
}); //ALERTCONTROLLER
alert.present();
  }

  updateToken(token: string, uid: string){

    firebase.firestore().collection("users").doc(uid).set({  //devices to users.
      token: token,
      tokenUpdate: firebase.firestore.FieldValue.serverTimestamp()

    }, {
      merge: true
    }).then(() => {
      console.log("token saved to cloud firestore");
    }).catch(err => {
      console.log(err);
    })

  }


  getPosts() {

    this.user = [];
    console.log(firebase.auth().currentUser.uid);
    firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).get().then((data) => {

        this.StudentType = data.data().usertype || "none";
        this.StudentNumber = data.data().studentnumber || "none";
        //this.idea=data.data().survey_value || "none";

        //console.log(this.idea);
      })

//firebase.auth().currentUser.


  //////////////////////ORIGINAL FUNCTION///////////////////////

    this.posts = [];

    let loading = this.loadingCtrl.create({
      content: "Loading Feed..."
    });

    loading.present();

    let query = firebase.firestore().collection("posts").orderBy("created", "desc").limit(this.pageSize);

    query.onSnapshot((snapshot) => {
      let changedDocs = snapshot.docChanges();

      changedDocs.forEach((change) => {
        if (change.type == "added") {
          // TODO
        }

        if (change.type == "modified") {
          for (let i = 0; i < this.posts.length; i++) {
            if (this.posts[i].id == change.doc.id) {
              this.posts[i] = change.doc;
            }
          }
        }

        if (change.type == "removed") {
          // TODO
        }
      })
    })
    //get from firestore and push each post to posts[] array.
    query.get()
      .then((docs) => {

        docs.forEach((doc) => {
          this.posts.push(doc);

        })
    //necessary to execute as soon as page loads - see constructor

        loading.dismiss();

        this.cursor = this.posts[this.posts.length - 1];

        console.log(this.posts)

      }).catch((err) => {
        console.log(err)
      })
  }

  loadMorePosts(event) {

    firebase.firestore().collection("posts").orderBy("created", "desc").startAfter(this.cursor).limit(this.pageSize).get()
      .then((docs) => {

        docs.forEach((doc) => {
          this.posts.push(doc);
        })

        console.log(this.posts)

        if (docs.size < this.pageSize) {
          // all documents have been loaded
          event.enable(false);
          this.infiniteEvent = event;
        } else {
          event.complete();
          this.cursor = this.posts[this.posts.length - 1];
        }

      }).catch((err) => {
        console.log(err)
      })

  }

  refresh(event) {

    this.posts = [];

    this.getPosts();

    if (this.infiniteEvent) {
      this.infiniteEvent.enable(true);
    }

    event.complete();

  }

  post() {

    firebase.firestore().collection("posts").add({
      text: this.text,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: firebase.auth().currentUser.uid,
      owner_name: firebase.auth().currentUser.displayName,
      owner_email: firebase.auth().currentUser.email
    }).then(async (doc) => {
      console.log(doc)


      if (this.image) {
        await this.upload(doc.id)
      }

      this.text = "";
      this.image = undefined;

      let toast = this.toastCtrl.create({
        message: "Your post has been created successfully.",
        duration: 3000
      }).present();

      this.getPosts();
    }).catch((err) => {
      console.log(err)
    })


  }

  ago(time) {
    let difference = moment(time).diff(moment());
    return moment.duration(difference).humanize();
  }

  logout() {

    firebase.auth().signOut().then(() => {

      let toast = this.toastCtrl.create({
        message: "You have been logged out successfully.",
        duration: 3000
      }).present();

      this.navCtrl.setRoot(LoginPage);
    });

  }


gotoComments() {


}


  addPhoto() {

    this.launchCamera();

  }

  launchCamera() {
    let options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetHeight: 512,
      targetWidth: 512,
      allowEdit: true
    }

    this.camera.getPicture(options).then((base64Image) => {
      console.log(base64Image);

      this.image = "data:image/png;base64," + base64Image;


    }).catch((err) => {
      console.log(err)
    })
  }

  upload(name: string) {

    return new Promise((resolve, reject) => {

      let loading = this.loadingCtrl.create({
        content: "Uploading Image..."
      })

      loading.present();

      let ref = firebase.storage().ref("postImages/" + name);

      let uploadTask = ref.putString(this.image.split(',')[1], "base64");

      uploadTask.on("state_changed", (taskSnapshot: any) => {
        console.log(taskSnapshot)
        let percentage = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes * 100;
        loading.setContent("Uploaded " + percentage + "% ...")

      }, (error) => {
        console.log(error)
      }, () => {
        console.log("The upload is complete!");

        uploadTask.snapshot.ref.getDownloadURL().then((url) => {

          firebase.firestore().collection("posts").doc(name).update({
            image: url
          }).then(() => {
            loading.dismiss()
            resolve()
          }).catch((err) => {
            loading.dismiss()
            reject()
          })

        }).catch((err) => {
          loading.dismiss()
          reject()
        })

      })

    })

  }

  like(post) {

    let body = {
      postId: post.id,
      userId: firebase.auth().currentUser.uid,
      action: post.data().likes && post.data().likes[firebase.auth().currentUser.uid] == true ? "unlike" : "like"
    }

    let toast = this.toastCtrl.create({
      message: "Updating like... Please wait."
    });

    toast.present();
//https://us-central1-myapp-93470.cloudfunctions.net/updateLikesCount
    this.http.post("https://europe-west1-myapp-93470.cloudfunctions.net/updateLikesCount", JSON.stringify(body), {
      responseType: "text"
    }).subscribe((data) => {
      console.log(data)

      toast.setMessage("Like updated!");
      setTimeout(() => {
        toast.dismiss();
      }, 3000)

    }, (error) => {
      toast.setMessage("An error has occured. Please try again later.")
      setTimeout(() => {
        toast.dismiss();
      }, 3000)
      console.log(error)
    })

  }

  comment(post) {

            this.modalCtrl.create(CommentsPage, {
              "post": post
            }).present();

  }

//  deleteQuestion(post: string)
//  {
//
//    firebase.firestore().collection("archive").doc().add({
//        text: post.data().text,
//        created: post.data().created,
//        owner: post.data().owner,
//        owner_name: post.data().owner_name,
//        owner_email: post.data().owner_email
//      }).then(async (doc) => {
//        console.log(doc)
//
//      }).catch((err) => {
//        console.log(err)
//      })
//
//
//    firebase.firestore().collection("posts").doc("post").delete().then(function() {
//      console.log("Deleted");
//    }).catch(function(error) {
//      console.error("Error:", error);
//    })
//}


}
