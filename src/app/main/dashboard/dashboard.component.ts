import {Component, OnInit} from '@angular/core';
import {UserService} from '../../user/user.service';
import {User} from '../../models/user';
import {UserFollowCount} from '../../models/userFollowCount';
import {FollowersService} from '../../user/followers.service';
import {PostsService} from '../../user/posts.service';
import {getUrlScheme} from '@angular/compiler';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    lineChartData = [
        {data: [30, 15, 44, 65, 23, 104, 80], label: 'Upvotes per month'},
        {data: [30, 45, 99, 164, 187, 291, 371], label: 'Total upvotes'}
    ];
    lineChartLabels: Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    lineChartColors: Array<Object> = [
        { // dark grey
            backgroundColor: 'rgba(139,195,74,0.2)',
            borderColor: 'rgba(139,195,74,1)',
            pointBackgroundColor: 'rgba(77,83,96,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        },
        { // grey
            backgroundColor: 'rgba(205,220,57,0.2)',
            borderColor: 'rgba(205,220,57,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }

    ];

    followCount = new UserFollowCount();
    followers = [];
    following = [];
    posts = [];

    userUpvotes = {};
    user = new User();

    constructor(private followersService: FollowersService,
                private postsService: PostsService,
                private userService: UserService) {
    }

    ngOnInit() {
        this.userService.user$.subscribe(user => this.updateAll(user));
    }

    getUserUpvotes() {
        const toVoter = vote => vote.voter;

        return this.posts
            .reduce((all, current) => {
                const postVoters = current.active_votes.map(toVoter);

                return all.concat(postVoters);
            }, [])
            .reduce((all, current) => {
                all[current] = (all[current] || 0) + 1;
                return all;
            }, {});
    }

    private addUpvoteCount(upvotes) {
        this.followers = this.followers.map(follower => {
            console.log(follower, upvotes[follower.name]);
            follower.upvoted = upvotes[follower.name] || 0;
            return follower;
        });
    }

    private updateAll(user) {
        this.user = user;

        const promises = [
            this.followersService.getFollowCount(user.name),
            this.followersService.getFollowers(user.name),
            this.postsService.getPostsByUser(user.name)
        ];

        Promise.all(promises).then(([followCount, followers, posts]) => {
            this.followCount = followCount;
            this.followers = followers.map(follower => ({name: follower}));
            this.posts = posts;

            const upvotes = this.getUserUpvotes();
            console.log(upvotes);
            this.addUpvoteCount(upvotes);

            console.log(this.followers);
        });
    }
}
