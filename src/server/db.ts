import fs from 'fs';
import path from 'path';
import { User, Quiz, Question, QuizAttempt, OptionKey } from '../types/quiz.ts';

export interface DatabaseSchema {
  users: User[];
  quizzes: Quiz[];
  questions: Question[];
  quiz_attempts: QuizAttempt[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'quiz_database.json');

const INITIAL_USERS: User[] = [
  {
    id: 'usr_alex',
    username: 'Alex Chen',
    email: 'alex.chen@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'usr_sarah',
    username: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'usr_marcus',
    username: 'Marcus Vance',
    email: 'marcus.v@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'usr_elena',
    username: 'Elena Rostova',
    email: 'elena.r@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'usr_current',
    username: 'Guest Quizzer',
    email: 'guest@quizmaster.dev',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  }
];

const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz_js_mastery',
    title: 'Modern JavaScript & TypeScript Mastery',
    description: 'Test your understanding of asynchronous execution, closures, event loop, TypeScript type systems, and ESNext paradigms.',
    category: 'Programming',
    difficulty: 'Medium',
    time_limit: 300, // 5 minutes
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'quiz_react_fullstack',
    title: 'React & Full-Stack Architecture',
    description: 'Component lifecycles, React 19 hooks, reconciliation, state immutability, SSR patterns, and RESTful API integration.',
    category: 'Web Development',
    difficulty: 'Medium',
    time_limit: 360, // 6 minutes
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 'quiz_db_sql',
    title: 'Database Systems & SQL Essentials',
    description: 'Relational design, normalization rules, indexes, ACID transaction guarantees, join algorithms, and execution optimization.',
    category: 'Databases',
    difficulty: 'Hard',
    time_limit: 420, // 7 minutes
    created_at: new Date(Date.now() - 16 * 86400000).toISOString(),
  },
  {
    id: 'quiz_cs_algo',
    title: 'Computer Science & Algorithms Core',
    description: 'Time & space complexity (Big-O), data structures, graph traversals, dynamic programming, and binary search trees.',
    category: 'Computer Science',
    difficulty: 'Hard',
    time_limit: 480, // 8 minutes
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'quiz_cloud_devops',
    title: 'Cloud Infrastructure & DevOps Practices',
    description: 'Containers, Kubernetes concepts, CI/CD pipelines, load balancing, DNS, microservice isolation, and security hygiene.',
    category: 'DevOps & Cloud',
    difficulty: 'Easy',
    time_limit: 240, // 4 minutes
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  }
];

const INITIAL_QUESTIONS: Question[] = [
  // --- Modern JS & TS Quiz Questions ---
  {
    id: 'q_js_1',
    quiz_id: 'quiz_js_mastery',
    question_text: 'What will be logged to the console by the following code?\nconsole.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);',
    option_a: '1, 2, 3, 4',
    option_b: '1, 4, 3, 2',
    option_c: '1, 4, 2, 3',
    option_d: '1, 3, 4, 2',
    correct_answer: 'B',
    explanation: 'Synchronous operations run first (1, 4). Microtasks like Promise.then() run before Macrotasks like setTimeout(..., 0), yielding 1, 4, 3, 2.'
  },
  {
    id: 'q_js_2',
    quiz_id: 'quiz_js_mastery',
    question_text: 'Which TypeScript utility type constructs a type with all properties of Type set to optional?',
    option_a: 'Readonly<Type>',
    option_b: 'Omit<Type, Keys>',
    option_c: 'Partial<Type>',
    option_d: 'Record<Keys, Type>',
    correct_answer: 'C',
    explanation: 'Partial<Type> creates a new type containing all properties of Type marked as optional.'
  },
  {
    id: 'q_js_3',
    quiz_id: 'quiz_js_mastery',
    question_text: 'What does a JavaScript closure primarily allow an inner function to do?',
    option_a: 'Execute in a multi-threaded web worker automatically',
    option_b: 'Access variables from its outer (enclosing) lexical scope even after that scope has finished executing',
    option_c: 'Prevent all garbage collection of the entire window object',
    option_d: 'Convert synchronous callback functions into WebAssembly bytecode',
    correct_answer: 'B',
    explanation: 'A closure gives a function access to its outer scope variables from an inner function, preserved across invocations.'
  },
  {
    id: 'q_js_4',
    quiz_id: 'quiz_js_mastery',
    question_text: 'What is the output of `typeof null` in standard JavaScript?',
    option_a: '"null"',
    option_b: '"undefined"',
    option_c: '"object"',
    option_d: '"boolean"',
    correct_answer: 'C',
    explanation: 'In JavaScript, typeof null evaluates to "object" due to an infamous legacy design quirk dating back to the first JS implementation in 1995.'
  },
  {
    id: 'q_js_5',
    quiz_id: 'quiz_js_mastery',
    question_text: 'Which method creates a new array with all sub-array elements concatenated recursively up to a specified depth?',
    option_a: 'Array.prototype.concatAll()',
    option_b: 'Array.prototype.flatMap()',
    option_c: 'Array.prototype.flat()',
    option_d: 'Array.prototype.reduceRight()',
    correct_answer: 'C',
    explanation: 'Array.prototype.flat(depth) flattens nested arrays to the specified depth (defaulting to 1).'
  },
  {
    id: 'q_js_6',
    quiz_id: 'quiz_js_mastery',
    question_text: 'What is the purpose of the `unknown` type in TypeScript compared to `any`?',
    option_a: 'unknown allows assigning to any type without type checking',
    option_b: 'unknown is type-safe: you cannot invoke methods or access properties on it without narrowing or assertion first',
    option_c: 'unknown is identical to never and can never hold a runtime value',
    option_d: 'unknown only permits null or undefined values',
    correct_answer: 'B',
    explanation: 'unknown is the type-safe counterpart of any. Operations on unknown require type narrowing or assertions beforehand.'
  },

  // --- React & Web Dev Questions ---
  {
    id: 'q_react_1',
    quiz_id: 'quiz_react_fullstack',
    question_text: 'Why must unique and stable `key` props be provided when rendering a dynamic list in React?',
    option_a: 'Keys are sent to CSS selectors to style each list item uniquely',
    option_b: 'Keys enable React reconciliation to identify which items have changed, been added, or removed efficiently',
    option_c: 'Keys prevent components from unmounting even when removed from the DOM',
    option_d: 'Keys allow children components to modify parent props directly',
    correct_answer: 'B',
    explanation: 'React uses keys to match existing children in the Virtual DOM tree with new children during reconciliation.'
  },
  {
    id: 'q_react_2',
    quiz_id: 'quiz_react_fullstack',
    question_text: 'Which hook should you use to cache the result of an expensive calculation between re-renders?',
    option_a: 'useCallback',
    option_b: 'useMemo',
    option_c: 'useRef',
    option_d: 'useLayoutEffect',
    correct_answer: 'B',
    explanation: 'useMemo caches the result of a calculation between renders unless its dependencies change. (useCallback caches function definitions).'
  },
  {
    id: 'q_react_3',
    quiz_id: 'quiz_react_fullstack',
    question_text: 'Which HTTP status code signifies that a requested resource was created successfully on the server?',
    option_a: '200 OK',
    option_b: '201 Created',
    option_c: '204 No Content',
    option_d: '304 Not Modified',
    correct_answer: 'B',
    explanation: 'HTTP 201 Created indicates that the request has succeeded and resulted in the creation of a new resource.'
  },
  {
    id: 'q_react_4',
    quiz_id: 'quiz_react_fullstack',
    question_text: 'What happens when `useRef` value is updated (e.g. `ref.current = newValue`)?',
    option_a: 'The component immediately re-renders',
    option_b: 'The component re-renders asynchronously on the next tick',
    option_c: 'The value changes without triggering a component re-render',
    option_d: 'An error is thrown unless wrapped in startTransition',
    correct_answer: 'C',
    explanation: 'Updating a ref is a pure mutation of its current property and does not notify React or trigger a re-render.'
  },
  {
    id: 'q_react_5',
    quiz_id: 'quiz_react_fullstack',
    question_text: 'What does CORS (Cross-Origin Resource Sharing) protect against?',
    option_a: 'SQL injection on the backend database',
    option_b: 'Malicious websites making unauthorized read requests to another domain using the user\'s browser credentials',
    option_c: 'Denial of Service attacks by rate limiting user IP addresses',
    option_d: 'Client-side memory leaks in Single Page Applications',
    correct_answer: 'B',
    explanation: 'CORS is a browser security mechanism that restricts resources requested from another origin to prevent unauthorized cross-origin reading.'
  },

  // --- Database & SQL Questions ---
  {
    id: 'q_db_1',
    quiz_id: 'quiz_db_sql',
    question_text: 'What does the "I" stand for in ACID database transaction properties?',
    option_a: 'Integrity',
    option_b: 'Isolation',
    option_c: 'Indexing',
    option_d: 'Idempotency',
    correct_answer: 'B',
    explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.'
  },
  {
    id: 'q_db_2',
    quiz_id: 'quiz_db_sql',
    question_text: 'What is the primary difference between a WHERE clause and a HAVING clause in SQL?',
    option_a: 'WHERE filters rows after aggregation; HAVING filters rows before aggregation',
    option_b: 'WHERE filters individual rows before grouping; HAVING filters aggregated groups after GROUP BY',
    option_c: 'WHERE only works on numeric columns; HAVING works on string columns',
    option_d: 'WHERE can only be used with SELECT; HAVING can be used with UPDATE',
    correct_answer: 'B',
    explanation: 'WHERE filters rows before aggregation occurs, while HAVING filters aggregated results (like COUNT, SUM) after GROUP BY.'
  },
  {
    id: 'q_db_3',
    quiz_id: 'quiz_db_sql',
    question_text: 'Which Normal Form requires that every non-key attribute must be non-transitively dependent on the primary key?',
    option_a: 'First Normal Form (1NF)',
    option_b: 'Second Normal Form (2NF)',
    option_c: 'Third Normal Form (3NF)',
    option_d: 'Boyce-Codd Normal Form (BCNF)',
    correct_answer: 'C',
    explanation: '3NF requires that the table is in 2NF and that all attributes are directly dependent on the primary key, eliminating transitive dependencies.'
  },
  {
    id: 'q_db_4',
    quiz_id: 'quiz_db_sql',
    question_text: 'What data structure is most commonly utilized by relational database engines for B-Tree indexes?',
    option_a: 'B+ Tree',
    option_b: 'Binary Search Tree',
    option_c: 'Red-Black Tree',
    option_d: 'Trie',
    correct_answer: 'A',
    explanation: 'Most relational databases (PostgreSQL, MySQL InnoDB, SQLite) use B+ Trees because leaf nodes form a linked list, optimizing sequential range scans.'
  },
  {
    id: 'q_db_5',
    quiz_id: 'quiz_db_sql',
    question_text: 'What will a `LEFT JOIN` return when a row in the left table has no matching row in the right table?',
    option_a: 'The row is omitted from the result set',
    option_b: 'The row is returned with NULL values for the right table columns',
    option_c: 'A runtime foreign key constraint violation is raised',
    option_d: 'The query hangs until a timeout occurs',
    correct_answer: 'B',
    explanation: 'A LEFT JOIN returns all records from the left table, and the matched records from the right table; if no match exists, NULL values are filled.'
  },

  // --- Computer Science & Algorithms Questions ---
  {
    id: 'q_cs_1',
    quiz_id: 'quiz_cs_algo',
    question_text: 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (AVL or Red-Black)?',
    option_a: 'O(1)',
    option_b: 'O(log n)',
    option_c: 'O(n)',
    option_d: 'O(n log n)',
    correct_answer: 'B',
    explanation: 'In a balanced binary search tree, the height is logarithmic (log2 n), making lookup, insertion, and deletion O(log n).'
  },
  {
    id: 'q_cs_2',
    quiz_id: 'quiz_cs_algo',
    question_text: 'Which algorithm is best suited for finding the shortest path from a single source node in a graph with non-negative edge weights?',
    option_a: 'Kruskal\'s Algorithm',
    option_b: 'Dijkstra\'s Algorithm',
    option_c: 'Floyd-Warshall Algorithm',
    option_d: 'Depth First Search (DFS)',
    correct_answer: 'B',
    explanation: 'Dijkstra\'s algorithm finds the shortest paths between nodes in a graph with non-negative edge weights in O((V + E) log V) with a priority queue.'
  },
  {
    id: 'q_cs_3',
    quiz_id: 'quiz_cs_algo',
    question_text: 'Which data structure operates on a First-In, First-Out (FIFO) principle?',
    option_a: 'Stack',
    option_b: 'Queue',
    option_c: 'Max Heap',
    option_d: 'Priority Queue',
    correct_answer: 'B',
    explanation: 'A Queue operates under FIFO (First-In, First-Out). Stacks operate under LIFO (Last-In, First-Out).'
  },
  {
    id: 'q_cs_4',
    quiz_id: 'quiz_cs_algo',
    question_text: 'What is a "Deadlock" condition in operating systems?',
    option_a: 'When CPU clock speed exceeds the maximum rated thermal capacity',
    option_b: 'A state where two or more processes are unable to proceed because each is waiting for the other to release a resource',
    option_c: 'When hard drive sectors become permanently corrupted',
    option_d: 'When a network packet repeatedly circles a routing loop until TTL expires',
    correct_answer: 'B',
    explanation: 'Deadlock happens when a set of concurrent processes are blocked because each process is holding a resource and waiting for another held by another process.'
  },
  {
    id: 'q_cs_5',
    quiz_id: 'quiz_cs_algo',
    question_text: 'What is the worst-case time complexity of QuickSort?',
    option_a: 'O(n log n)',
    option_b: 'O(n^2)',
    option_c: 'O(log n)',
    option_d: 'O(n)',
    correct_answer: 'B',
    explanation: 'QuickSort has an average complexity of O(n log n), but degrades to O(n^2) when an unbalanced partition is repeatedly chosen (e.g. sorted array with first element as pivot).'
  },

  // --- DevOps & Cloud Questions ---
  {
    id: 'q_cloud_1',
    quiz_id: 'quiz_cloud_devops',
    question_text: 'What is the primary fundamental difference between a Docker container and a Virtual Machine (VM)?',
    option_a: 'Containers virtualize hardware; VMs share the host kernel',
    option_b: 'Containers share the host OS kernel and isolate at process level, while VMs run full guest operating systems on a hypervisor',
    option_c: 'Containers can only execute compiled C++ binaries',
    option_d: 'VMs do not require RAM or storage allocations',
    correct_answer: 'B',
    explanation: 'Containers share the host operating system kernel and run as isolated processes, making them significantly lighter and faster than VMs.'
  },
  {
    id: 'q_cloud_2',
    quiz_id: 'quiz_cloud_devops',
    question_text: 'In Kubernetes, what is the smallest deployable computing unit that can be created and managed?',
    option_a: 'Cluster',
    option_b: 'Node',
    option_c: 'Pod',
    option_d: 'Namespace',
    correct_answer: 'C',
    explanation: 'A Pod is the smallest execution unit in Kubernetes, encapsulating one or more containers sharing network and storage.'
  },
  {
    id: 'q_cloud_3',
    quiz_id: 'quiz_cloud_devops',
    question_text: 'What does a Reverse Proxy (such as Nginx or Envoy) do?',
    option_a: 'Sits between clients and origin servers to handle routing, SSL termination, caching, and load balancing',
    option_b: 'Allows employees inside a corporate LAN to access the external internet anonymously',
    option_c: 'Decrypts database files stored on disk',
    option_d: 'Acts as a compiler for client-side JavaScript bundles',
    correct_answer: 'A',
    explanation: 'A reverse proxy sits in front of web servers and forwards client requests to those servers, handling SSL termination, load balancing, and security.'
  },
  {
    id: 'q_cloud_4',
    quiz_id: 'quiz_cloud_devops',
    question_text: 'Which DNS record type maps a hostname directly to an IPv4 address?',
    option_a: 'AAAA Record',
    option_b: 'CNAME Record',
    option_c: 'A Record',
    option_d: 'MX Record',
    correct_answer: 'C',
    explanation: 'An "A" (Address) record maps a domain name to an IPv4 address. (AAAA maps to IPv6).'
  }
];

const INITIAL_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att_1',
    user_id: 'usr_sarah',
    quiz_id: 'quiz_js_mastery',
    score: 100,
    correct_answers: 6,
    wrong_answers: 0,
    time_taken: 114,
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'att_2',
    user_id: 'usr_marcus',
    quiz_id: 'quiz_js_mastery',
    score: 83,
    correct_answers: 5,
    wrong_answers: 1,
    time_taken: 142,
    completed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'att_3',
    user_id: 'usr_alex',
    quiz_id: 'quiz_react_fullstack',
    score: 100,
    correct_answers: 5,
    wrong_answers: 0,
    time_taken: 135,
    completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'att_4',
    user_id: 'usr_elena',
    quiz_id: 'quiz_db_sql',
    score: 100,
    correct_answers: 5,
    wrong_answers: 0,
    time_taken: 180,
    completed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'att_5',
    user_id: 'usr_alex',
    quiz_id: 'quiz_db_sql',
    score: 80,
    correct_answers: 4,
    wrong_answers: 1,
    time_taken: 165,
    completed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'att_6',
    user_id: 'usr_sarah',
    quiz_id: 'quiz_cs_algo',
    score: 80,
    correct_answers: 4,
    wrong_answers: 1,
    time_taken: 210,
    completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

class QuizDatabase {
  private schema: DatabaseSchema;

  constructor() {
    this.schema = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.quizzes && parsed.questions && parsed.users) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing database file, initializing seeds:', e);
    }

    const defaultData: DatabaseSchema = {
      users: INITIAL_USERS,
      quizzes: INITIAL_QUIZZES,
      questions: INITIAL_QUESTIONS,
      quiz_attempts: INITIAL_ATTEMPTS,
    };

    this.saveDatabase(defaultData);
    return defaultData;
  }

  private saveDatabase(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }

  // --- Users Operations ---
  public getUsers(): User[] {
    return this.schema.users;
  }

  public getUserById(id: string): User | undefined {
    return this.schema.users.find(u => u.id === id);
  }

  public getUserByUsername(username: string): User | undefined {
    return this.schema.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  public getUserByEmail(email: string): User | undefined {
    return this.schema.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: { username: string; email: string; avatar_url?: string }): User {
    const existing = this.getUserByEmail(userData.email) || this.getUserByUsername(userData.username);
    if (existing) {
      return existing;
    }

    const newUser: User = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      username: userData.username.trim(),
      email: userData.email.trim(),
      avatar_url: userData.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.username)}`,
      created_at: new Date().toISOString(),
    };

    this.schema.users.push(newUser);
    this.saveDatabase(this.schema);
    return newUser;
  }

  // --- Quizzes Operations ---
  public getQuizzes(): Quiz[] {
    return this.schema.quizzes.map(quiz => {
      const qQuestions = this.schema.questions.filter(q => q.quiz_id === quiz.id);
      const attempts = this.schema.quiz_attempts.filter(a => a.quiz_id === quiz.id);
      const avgScore = attempts.length > 0 
        ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length) 
        : 0;

      return {
        ...quiz,
        question_count: qQuestions.length,
        attempts_count: attempts.length,
        average_score: avgScore,
      };
    });
  }

  public getQuizById(id: string): (Quiz & { questions: Question[] }) | undefined {
    const quiz = this.schema.quizzes.find(q => q.id === id);
    if (!quiz) return undefined;

    const questions = this.schema.questions.filter(q => q.quiz_id === id);
    const attempts = this.schema.quiz_attempts.filter(a => a.quiz_id === id);
    const avgScore = attempts.length > 0 
      ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length) 
      : 0;

    return {
      ...quiz,
      question_count: questions.length,
      attempts_count: attempts.length,
      average_score: avgScore,
      questions,
    };
  }

  public createQuiz(quizData: {
    title: string;
    description: string;
    category: string;
    difficulty: Quiz['difficulty'];
    time_limit: number;
    questions: Array<{
      question_text: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_answer: OptionKey;
      explanation?: string;
    }>;
  }): Quiz {
    const quizId = `quiz_${Date.now().toString(36)}`;
    const newQuiz: Quiz = {
      id: quizId,
      title: quizData.title,
      description: quizData.description,
      category: quizData.category,
      difficulty: quizData.difficulty,
      time_limit: quizData.time_limit,
      created_at: new Date().toISOString(),
    };

    const createdQuestions: Question[] = quizData.questions.map((q, idx) => ({
      id: `q_${quizId}_${idx + 1}`,
      quiz_id: quizId,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation || 'Option ' + q.correct_answer + ' is the correct answer.',
    }));

    this.schema.quizzes.unshift(newQuiz);
    this.schema.questions.push(...createdQuestions);
    this.saveDatabase(this.schema);

    return {
      ...newQuiz,
      question_count: createdQuestions.length,
      attempts_count: 0,
      average_score: 0,
    };
  }

  // --- Quiz Attempt Operations ---
  public submitAttempt(params: {
    user_id: string;
    username?: string;
    email?: string;
    quiz_id: string;
    time_taken: number;
    answers: Record<string, OptionKey>;
  }): {
    attempt: QuizAttempt;
    total_questions: number;
    breakdown: Array<{
      question_id: string;
      question_text: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      user_answer?: OptionKey | null;
      correct_answer: OptionKey;
      is_correct: boolean;
      explanation: string;
    }>;
    rank_in_quiz: number;
    total_attempts: number;
  } {
    // Ensure user exists
    let user = this.getUserById(params.user_id);
    if (!user) {
      user = this.createUser({
        username: params.username || 'Quizzer',
        email: params.email || `quizzer_${Date.now()}@quizmaster.dev`,
      });
    }

    const quiz = this.schema.quizzes.find(q => q.id === params.quiz_id);
    if (!quiz) throw new Error('Quiz not found');

    const questions = this.schema.questions.filter(q => q.quiz_id === params.quiz_id);
    let correctCount = 0;
    let wrongCount = 0;

    const breakdown = questions.map(q => {
      const userAnswer = params.answers[q.id];
      const isCorrect = userAnswer === q.correct_answer;
      if (userAnswer) {
        if (isCorrect) correctCount++;
        else wrongCount++;
      } else {
        wrongCount++; // unanswered counted as wrong or omitted
      }

      return {
        question_id: q.id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        user_answer: userAnswer || null,
        correct_answer: q.correct_answer || 'A',
        is_correct: isCorrect,
        explanation: q.explanation || 'Correct answer is option ' + q.correct_answer,
      };
    });

    const scorePercentage = questions.length > 0 
      ? Math.round((correctCount / questions.length) * 100) 
      : 0;

    const attempt: QuizAttempt = {
      id: `att_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      quiz_id: quiz.id,
      score: scorePercentage,
      correct_answers: correctCount,
      wrong_answers: wrongCount,
      time_taken: params.time_taken,
      completed_at: new Date().toISOString(),
      user: {
        username: user.username,
        avatar_url: user.avatar_url,
      },
      quiz: {
        title: quiz.title,
        category: quiz.category,
      }
    };

    this.schema.quiz_attempts.push(attempt);
    this.saveDatabase(this.schema);

    // Calculate ranking in this quiz
    const quizAttempts = this.schema.quiz_attempts
      .filter(a => a.quiz_id === quiz.id)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time_taken - b.time_taken; // lower time wins tie-break
      });

    const rankInQuiz = quizAttempts.findIndex(a => a.id === attempt.id) + 1;

    return {
      attempt,
      total_questions: questions.length,
      breakdown,
      rank_in_quiz: rankInQuiz > 0 ? rankInQuiz : 1,
      total_attempts: quizAttempts.length,
    };
  }

  // --- Leaderboard Operations ---
  public getLeaderboard(quizId?: string) {
    let attempts = [...this.schema.quiz_attempts];
    if (quizId) {
      attempts = attempts.filter(a => a.quiz_id === quizId);
    }

    // Sort: highest score first, then lowest time taken, then earlier completion
    attempts.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.time_taken !== b.time_taken) return a.time_taken - b.time_taken;
      return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
    });

    return attempts.map((att, idx) => {
      const user = this.getUserById(att.user_id);
      const quiz = this.schema.quizzes.find(q => q.id === att.quiz_id);

      return {
        rank: idx + 1,
        id: att.id,
        user_id: att.user_id,
        username: user ? user.username : 'Quizzer',
        avatar_url: user?.avatar_url,
        quiz_id: att.quiz_id,
        quiz_title: quiz?.title || 'Unknown Quiz',
        score: att.score,
        correct_answers: att.correct_answers,
        wrong_answers: att.wrong_answers,
        time_taken: att.time_taken,
        completed_at: att.completed_at,
      };
    });
  }

  // --- Aggregated User Stats ---
  public getUserStats(userId: string) {
    const user = this.getUserById(userId);
    if (!user) return null;

    const userAttempts = this.schema.quiz_attempts
      .filter(a => a.user_id === userId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

    const totalAttempts = userAttempts.length;
    const avgScore = totalAttempts > 0
      ? Math.round(userAttempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts)
      : 0;
    const bestScore = totalAttempts > 0
      ? Math.max(...userAttempts.map(a => a.score))
      : 0;
    const totalTimeSpent = userAttempts.reduce((acc, curr) => acc + curr.time_taken, 0);

    return {
      user,
      total_attempts: totalAttempts,
      quizzes_completed: new Set(userAttempts.map(a => a.quiz_id)).size,
      average_score: avgScore,
      best_score: bestScore,
      total_time_spent: totalTimeSpent,
      recent_attempts: userAttempts.slice(0, 10),
    };
  }

  // --- System Stats ---
  public getSystemStats() {
    const totalQuizzes = this.schema.quizzes.length;
    const totalQuestions = this.schema.questions.length;
    const totalAttempts = this.schema.quiz_attempts.length;
    const totalUsers = this.schema.users.length;
    const avgScore = totalAttempts > 0
      ? Math.round(this.schema.quiz_attempts.reduce((a, b) => a + b.score, 0) / totalAttempts)
      : 0;

    return {
      total_quizzes: totalQuizzes,
      total_questions: totalQuestions,
      total_attempts: totalAttempts,
      total_users: totalUsers,
      average_score: avgScore,
    };
  }
}

export const db = new QuizDatabase();
