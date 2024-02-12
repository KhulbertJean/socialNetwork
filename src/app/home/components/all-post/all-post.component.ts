import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user.model.js';
import { AuthService } from 'src/app/auth/services/auth.service.js';

import { PostService } from '../../services/post.service.js';
import { ModalComponent } from '../start-post/modal/modal.component.js';
import {Post} from "../../models/Post.js";

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-post.component.html',
  styleUrls: ['./all-post.component.scss'],
})
export class AllPostsComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  @Input() postBody?: string;

  private userSubscription!: Subscription;

  queryParams!: string;
  allLoadedPosts: Post[] = [];
  numberOfPosts = 5;
  skipPosts = 0;

  userId$ = new BehaviorSubject<number>(0);

  constructor(
      private postService: PostService,
      private authService: AuthService,
      public modalController: ModalController
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.userStream.subscribe(
        (user: User | null) => { // Modifier le type de 'user' pour inclure 'null'
          if (user) {
            this.allLoadedPosts.forEach((post: any, index: number) => { // Utilisez 'any' pour 'post'
              if (user?.imagePath && post.author.id === user.id) {
                post['fullImagePath'] = this.authService.getFullImagePath(user.imagePath); // Accédez à la propriété dynamiquement
              }
            });
          }
        }
    );



    this.getPosts(false, '');

    this.authService.userId.pipe(take(1)).subscribe((userId: number) => {
      this.userId$.next(userId);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const postBody = changes['postBody'].currentValue; // Accédez à 'postBody' en utilisant la notation d'index
    if (!postBody) return;

    this.postService.createPost(postBody).subscribe((post: any) => { // Utilisation de 'any' pour 'post'
      this.authService.userFullImagePath
          .pipe(take(1))
          .subscribe((fullImagePath: string) => {
            post['fullImagePath'] = fullImagePath; // Utilisation de la notation d'index pour ajouter la propriété 'fullImagePath'
            this.allLoadedPosts.unshift(post);
          });
    });
  }


  getPosts(isInitialLoad: boolean, event: any) {
    if (this.skipPosts === 20) {
      event.target.disabled = true;
    }
    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`;

    this.postService
        .getSelectedPosts(this.queryParams)
        .subscribe((posts: Post[]) => {
          for (let postIndex = 0; postIndex < posts.length; postIndex++) {
            const authorImagePath = posts[postIndex].author?.imagePath; // Utilisation de '?' pour vérifier si 'imagePath' existe sur 'author'
            let fullImagePath = authorImagePath ?? this.authService.getDefaultFullImagePath(); // Utilisation de l'opérateur de coalescence nulle (??) pour fournir une valeur par défaut
            if (authorImagePath) {
              fullImagePath = this.authService.getFullImagePath(authorImagePath);
            }
            (posts[postIndex] as any)['fullImagePath'] = fullImagePath; // Assertion de type pour permettre l'ajout de 'fullImagePath'
            this.allLoadedPosts.push(posts[postIndex]);
          }
          if (isInitialLoad) event.target.complete();
          this.skipPosts = this.skipPosts + 5;
        });
  }



  loadData(event: any) {
    this.getPosts(true, event);
  }

  async presentUpdateModal(postId: number) {
    console.log('EDIT POST');
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class2',
      componentProps: {
        postId,
      },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (!data) return;

    const newPostBody = data.post.body;
    this.postService.updatePost(postId, newPostBody).subscribe(() => {
      const postIndex = this.allLoadedPosts.findIndex(
          (post: Post) => post.id === postId
      );
      this.allLoadedPosts[postIndex].body = newPostBody;
    });
  }

  deletePost(postId: number) {
    this.postService.deletePost(postId).subscribe(() => {
      this.allLoadedPosts = this.allLoadedPosts.filter(
          (post: Post) => post.id !== postId
      );
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }
}
