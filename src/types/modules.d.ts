// Type declarations for modules that don't have types or have missing types

// ============================================
// NEXT.JS MODULE DECLARATIONS
// ============================================

declare module 'next/server' {
  export interface NextRequest extends Request {
    cookies: RequestCookies;
    nextUrl: URL;
    geo?: {
      city?: string;
      country?: string;
      region?: string;
    };
    ip?: string;
  }

  export interface RequestCookies {
    get(name: string): { name: string; value: string } | undefined;
    getAll(): { name: string; value: string }[];
    has(name: string): boolean;
    set(name: string, value: string): void;
    delete(name: string): void;
  }

  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
    cookies: ResponseCookies;
  }

  export interface ResponseCookies {
    get(name: string): { name: string; value: string } | undefined;
    getAll(): { name: string; value: string }[];
    set(name: string, value: string, options?: CookieOptions): void;
    delete(name: string): void;
  }

  export interface CookieOptions {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }
}

declare module 'next/link' {
  import { ComponentType, AnchorHTMLAttributes, ReactNode } from 'react';

  export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    href: string | { pathname: string; query?: Record<string, string> };
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    children?: ReactNode;
  }

  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string, options?: { scroll?: boolean }): void;
    replace(href: string, options?: { scroll?: boolean }): void;
    refresh(): void;
    back(): void;
    forward(): void;
    prefetch(href: string): void;
  };

  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams(): Record<string, string | string[]>;
  export function redirect(url: string, type?: 'push' | 'replace'): never;
  export function notFound(): never;
}

declare module 'next/dynamic' {
  import { ComponentType, ReactNode } from 'react';

  export interface DynamicOptions<P = {}> {
    loading?: () => ReactNode;
    ssr?: boolean;
  }

  export default function dynamic<P = {}>(
    dynamicImport: () => Promise<ComponentType<P> | { default: ComponentType<P> }>,
    options?: DynamicOptions<P>
  ): ComponentType<P>;
}

declare module 'next/image' {
  import { ComponentType, ImgHTMLAttributes } from 'react';

  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
    src: string | { src: string; height: number; width: number };
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    loader?: (params: { src: string; width: number; quality?: number }) => string;
    quality?: number;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    sizes?: string;
  }

  const Image: ComponentType<ImageProps>;
  export default Image;
}

// ============================================
// FIREBASE AUTH DECLARATIONS
// ============================================

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    phoneNumber: string | null;
    isAnonymous: boolean;
    tenantId: string | null;
    providerData: UserInfo[];
    refreshToken: string;
    metadata: UserMetadata;
    getIdToken(forceRefresh?: boolean): Promise<string>;
    getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
    reload(): Promise<void>;
    toJSON(): object;
    delete(): Promise<void>;
  }

  export interface UserInfo {
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
    uid: string;
  }

  export interface UserMetadata {
    creationTime?: string;
    lastSignInTime?: string;
  }

  export interface IdTokenResult {
    token: string;
    expirationTime: string;
    authTime: string;
    issuedAtTime: string;
    signInProvider: string | null;
    signInSecondFactor: string | null;
    claims: { [key: string]: any };
  }

  export interface Auth {
    currentUser: User | null;
    languageCode: string | null;
    tenantId: string | null;
    settings: AuthSettings;
    name: string;
    config: Config;
    onAuthStateChanged(
      nextOrObserver: (user: User | null) => void,
      error?: (error: Error) => void,
      completed?: () => void
    ): () => void;
    signOut(): Promise<void>;
  }

  export interface AuthSettings {
    appVerificationDisabledForTesting: boolean;
  }

  export interface Config {
    apiKey: string;
    authDomain: string;
    apiHost: string;
    apiScheme: string;
    tokenApiHost: string;
    sdkClientVersion: string;
  }

  export interface UserCredential {
    user: User;
    providerId: string | null;
    operationType: 'signIn' | 'link' | 'reauthenticate';
  }

  export interface AuthProvider {
    providerId: string;
  }

  export class GoogleAuthProvider implements AuthProvider {
    static PROVIDER_ID: string;
    static GOOGLE_SIGN_IN_METHOD: string;
    providerId: string;
    static credential(idToken?: string | null, accessToken?: string | null): OAuthCredential;
    addScope(scope: string): GoogleAuthProvider;
    setCustomParameters(customOAuthParameters: object): GoogleAuthProvider;
  }

  export class GithubAuthProvider implements AuthProvider {
    static PROVIDER_ID: string;
    providerId: string;
    static credential(accessToken: string): OAuthCredential;
    addScope(scope: string): GithubAuthProvider;
    setCustomParameters(customOAuthParameters: object): GithubAuthProvider;
  }

  export class EmailAuthProvider implements AuthProvider {
    static PROVIDER_ID: string;
    static EMAIL_PASSWORD_SIGN_IN_METHOD: string;
    static EMAIL_LINK_SIGN_IN_METHOD: string;
    providerId: string;
    static credential(email: string, password: string): AuthCredential;
    static credentialWithLink(email: string, emailLink: string): AuthCredential;
  }

  export interface AuthCredential {
    providerId: string;
    signInMethod: string;
  }

  export interface OAuthCredential extends AuthCredential {
    accessToken?: string;
    idToken?: string;
    secret?: string;
  }

  export function getAuth(app?: any): Auth;
  export function signInWithPopup(auth: Auth, provider: AuthProvider): Promise<UserCredential>;
  export function signInWithRedirect(auth: Auth, provider: AuthProvider): Promise<void>;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: (user: User | null) => void): () => void;
  export function updateProfile(user: User, profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
  export function sendPasswordResetEmail(auth: Auth, email: string): Promise<void>;
  export function sendEmailVerification(user: User): Promise<void>;
  export function updatePassword(user: User, newPassword: string): Promise<void>;
  export function reauthenticateWithCredential(user: User, credential: AuthCredential): Promise<UserCredential>;
}

// ============================================
// FIREBASE FIRESTORE DECLARATIONS
// ============================================

declare module 'firebase/firestore' {
  export interface Firestore {
    type: 'firestore' | 'firestore-lite';
    app: any;
    toJSON(): object;
  }

  export interface DocumentReference<T = DocumentData> {
    id: string;
    path: string;
    parent: CollectionReference<T>;
    firestore: Firestore;
  }

  export interface CollectionReference<T = DocumentData> {
    id: string;
    path: string;
    parent: DocumentReference<DocumentData> | null;
    firestore: Firestore;
  }

  export interface DocumentSnapshot<T = DocumentData> {
    id: string;
    ref: DocumentReference<T>;
    exists(): boolean;
    data(): T | undefined;
    get(fieldPath: string): any;
  }

  export interface QuerySnapshot<T = DocumentData> {
    docs: QueryDocumentSnapshot<T>[];
    size: number;
    empty: boolean;
    forEach(callback: (result: QueryDocumentSnapshot<T>) => void): void;
  }

  export interface QueryDocumentSnapshot<T = DocumentData> extends DocumentSnapshot<T> {
    data(): T;
  }

  export interface Query<T = DocumentData> {
    firestore: Firestore;
  }

  export interface DocumentData {
    [field: string]: any;
  }

  export interface Timestamp {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
    toMillis(): number;
    isEqual(other: Timestamp): boolean;
  }

  export const Timestamp: {
    now(): Timestamp;
    fromDate(date: Date): Timestamp;
    fromMillis(milliseconds: number): Timestamp;
  };

  export type WhereFilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any';
  export type OrderByDirection = 'desc' | 'asc';

  export function getFirestore(app?: any): Firestore;
  export function collection(firestore: Firestore, path: string, ...pathSegments: string[]): CollectionReference;
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference;
  export function doc(reference: CollectionReference, path?: string, ...pathSegments: string[]): DocumentReference;
  export function getDoc(reference: DocumentReference): Promise<DocumentSnapshot>;
  export function getDocs(query: Query): Promise<QuerySnapshot>;
  export function setDoc(reference: DocumentReference, data: any, options?: { merge?: boolean }): Promise<void>;
  export function addDoc(reference: CollectionReference, data: any): Promise<DocumentReference>;
  export function updateDoc(reference: DocumentReference, data: any): Promise<void>;
  export function deleteDoc(reference: DocumentReference): Promise<void>;
  export function query(query: Query, ...queryConstraints: any[]): Query;
  export function where(fieldPath: string, opStr: WhereFilterOp, value: any): any;
  export function orderBy(fieldPath: string, directionStr?: OrderByDirection): any;
  export function limit(limit: number): any;
  export function startAfter(...fieldValues: any[]): any;
  export function endBefore(...fieldValues: any[]): any;
  export function onSnapshot(reference: DocumentReference | Query, observer: { next: (snapshot: any) => void; error?: (error: Error) => void }): () => void;
  export function onSnapshot(reference: DocumentReference | Query, onNext: (snapshot: any) => void, onError?: (error: Error) => void): () => void;
  export function serverTimestamp(): any;
  export function arrayUnion(...elements: any[]): any;
  export function arrayRemove(...elements: any[]): any;
  export function increment(n: number): any;
  export function writeBatch(firestore: Firestore): any;
  export function runTransaction(firestore: Firestore, updateFunction: (transaction: any) => Promise<any>): Promise<any>;
}

// ============================================
// LUCIDE-REACT ICON DECLARATIONS
// ============================================

declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';

  export type Icon = ComponentType<SVGProps<SVGSVGElement> & {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }>;

  // All icons used in the project
  export const Activity: Icon;
  export const AlertCircle: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const Award: Icon;
  export const BarChart3: Icon;
  export const Battery: Icon;
  export const Bell: Icon;
  export const Book: Icon;
  export const BookOpen: Icon;
  export const Bookmark: Icon;
  export const BookmarkCheck: Icon;
  export const Bot: Icon;
  export const Brain: Icon;
  export const Briefcase: Icon;
  export const Building: Icon;
  export const Building2: Icon;
  export const Calendar: Icon;
  export const Check: Icon;
  export const CheckCircle: Icon;
  export const CheckCircle2: Icon;
  export const ChevronDown: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const ChevronUp: Icon;
  export const Circle: Icon;
  export const Clock: Icon;
  export const Code: Icon;
  export const Coffee: Icon;
  export const Copy: Icon;
  export const DollarSign: Icon;
  export const Download: Icon;
  export const Edit: Icon;
  export const ExternalLink: Icon;
  export const Eye: Icon;
  export const FileText: Icon;
  export const Filter: Icon;
  export const Flame: Icon;
  export const Globe: Icon;
  export const GraduationCap: Icon;
  export const Heart: Icon;
  export const Home: Icon;
  export const Info: Icon;
  export const Languages: Icon;
  export const Layers: Icon;
  export const LayoutDashboard: Icon;
  export const Library: Icon;
  export const LibrarySquare: Icon;
  export const Lightbulb: Icon;
  export const Link: Icon;
  export const Loader: Icon;
  export const Loader2: Icon;
  export const Lock: Icon;
  export const LogOut: Icon;
  export const Mail: Icon;
  export const Map: Icon;
  export const MapPin: Icon;
  export const Menu: Icon;
  export const MessageCircle: Icon;
  export const MessageSquare: Icon;
  export const Mic: Icon;
  export const MoreHorizontal: Icon;
  export const Navigation: Icon;
  export const Newspaper: Icon;
  export const Pencil: Icon;
  export const Play: Icon;
  export const Plus: Icon;
  export const RefreshCw: Icon;
  export const Repeat: Icon;
  export const Rocket: Icon;
  export const RotateCcw: Icon;
  export const Save: Icon;
  export const Search: Icon;
  export const Send: Icon;
  export const Settings: Icon;
  export const Share: Icon;
  export const Share2: Icon;
  export const Shield: Icon;
  export const Sparkles: Icon;
  export const Star: Icon;
  export const Sun: Icon;
  export const Target: Icon;
  export const ThumbsDown: Icon;
  export const ThumbsUp: Icon;
  export const Trash: Icon;
  export const Trash2: Icon;
  export const TrendingDown: Icon;
  export const TrendingUp: Icon;
  export const Trophy: Icon;
  export const Upload: Icon;
  export const User: Icon;
  export const UserCircle: Icon;
  export const UserPlus: Icon;
  export const Users: Icon;
  export const Video: Icon;
  export const X: Icon;
  export const XCircle: Icon;
  export const Zap: Icon;
}
