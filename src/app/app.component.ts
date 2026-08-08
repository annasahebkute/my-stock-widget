import { Component } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { auth } from './firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-stock-widget';
  email = '';
  password = '';
  isSignUp = false;
  isLoading = false;
  errorMessage = '';
  user: User | null = null;

  constructor() {
    onAuthStateChanged(auth, user => this.user = user);
  }

  async submit(): Promise<void> {
    this.errorMessage = '';
    this.isLoading = true;

    try {
      if (this.isSignUp) {
        await createUserWithEmailAndPassword(auth, this.email, this.password);
      } else {
        await signInWithEmailAndPassword(auth, this.email, this.password);
      }
    } catch (error: any) {
      this.errorMessage = this.getAuthError(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
  }

  private getAuthError(code: string): string {
    const messages: Record<string, string> = {
      'auth/invalid-credential': 'That email or password is incorrect.',
      'auth/email-already-in-use': 'An account already exists for this email.',
      'auth/weak-password': 'Use a password with at least 6 characters.',
      'auth/invalid-email': 'Enter a valid email address.'
    };

    return messages[code] || 'Unable to authenticate right now. Please try again.';
  }
}
