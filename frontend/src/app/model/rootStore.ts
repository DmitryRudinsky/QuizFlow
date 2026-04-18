import { QuizStore } from '@entities/Quiz/model/quizStore';
import { UserStore } from '@entities/User/model/userStore';
import { AuthStore } from '@features/Auth/model/authStore';
import { SessionStore } from '@features/LiveSession/model/sessionStore';
import { QuizBuilderStore } from '@features/QuizBuilder/model/quizBuilderStore';

export class RootStore {
    quiz: QuizStore;
    user: UserStore;
    auth: AuthStore;
    quizBuilder: QuizBuilderStore;
    session: SessionStore;

    constructor() {
        this.quiz = new QuizStore(this);
        this.user = new UserStore();
        this.auth = new AuthStore(this);
        this.quizBuilder = new QuizBuilderStore(this);
        this.session = new SessionStore(this);
    }
}
