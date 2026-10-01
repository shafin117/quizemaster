import express, { Request, Response } from 'express';
import { db } from './db.ts';
import { OptionKey } from '../types/quiz.ts';

export const apiRouter = express.Router();
export const app = express();

// Parse JSON
app.use(express.json());
app.use('/api', apiRouter);


// --- Quizzes Endpoints ---
apiRouter.get('/quizzes', (req: Request, res: Response) => {
  try {
    const quizzes = db.getQuizzes();
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to retrieve quizzes' });
  }
});

apiRouter.get('/quizzes/:id', (req: Request, res: Response) => {
  try {
    const quiz = db.getQuizById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Sanitize questions: strip correct_answer and explanation so client cannot cheat!
    const sanitizedQuestions = quiz.questions.map(q => ({
      id: q.id,
      quiz_id: q.quiz_id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
    }));

    res.json({
      ...quiz,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to retrieve quiz details' });
  }
});

apiRouter.post('/quizzes', (req: Request, res: Response) => {
  try {
    const { title, description, category, difficulty, time_limit, questions } = req.body;

    if (!title || !category || !difficulty || !time_limit || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Invalid quiz payload: title, category, difficulty, time_limit and at least one question are required' });
    }

    // Validate each question
    for (const q of questions) {
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) {
        return res.status(400).json({ error: 'Each question must have question_text, 4 options (a, b, c, d), and a correct_answer' });
      }
    }

    const newQuiz = db.createQuiz({
      title,
      description: description || '',
      category,
      difficulty,
      time_limit: Number(time_limit) || 300,
      questions,
    });

    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// --- Quiz Submission Endpoint ---
apiRouter.post('/quizzes/:id/submit', (req: Request, res: Response) => {
  try {
    const quizId = req.params.id;
    const { user_id, username, email, time_taken, answers } = req.body;

    if (!user_id || !answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid submission payload' });
    }

    const quiz = db.getQuizById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const result = db.submitAttempt({
      user_id,
      username: username || 'Quizzer',
      email: email || undefined,
      quiz_id: quizId,
      time_taken: Math.max(0, Number(time_taken) || 0),
      answers: answers as Record<string, OptionKey>,
    });

    const unansweredCount = quiz.questions.length - Object.keys(answers).length;

    res.json({
      attempt_id: result.attempt.id,
      quiz_id: quizId,
      quiz_title: quiz.title,
      user_id: result.attempt.user_id,
      username: username || 'Quizzer',
      total_questions: result.total_questions,
      correct_answers: result.attempt.correct_answers,
      wrong_answers: result.attempt.wrong_answers,
      unanswered: Math.max(0, unansweredCount),
      score: result.attempt.score,
      time_taken: result.attempt.time_taken,
      completed_at: result.attempt.completed_at,
      rank_in_quiz: result.rank_in_quiz,
      total_attempts: result.total_attempts,
      breakdown: result.breakdown,
    });
  } catch (error: any) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ error: error.message || 'Failed to submit quiz attempt' });
  }
});

// --- Leaderboard Endpoints ---
apiRouter.get('/leaderboard', (req: Request, res: Response) => {
  try {
    const quizId = req.query.quizId as string | undefined;
    const leaderboard = db.getLeaderboard(quizId);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

// --- Users & Profiles Endpoints ---
apiRouter.get('/users', (req: Request, res: Response) => {
  try {
    const users = db.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

apiRouter.post('/users/login-or-register', (req: Request, res: Response) => {
  try {
    const { username, email, avatar_url } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    const user = db.createUser({
      username,
      email,
      avatar_url,
    });

    res.json(user);
  } catch (error) {
    console.error('Error in login-or-register:', error);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

apiRouter.get('/users/:id/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getUserStats(req.params.id);
    if (!stats) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to retrieve user statistics' });
  }
});

// --- System Stats Endpoint ---
apiRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getSystemStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});
