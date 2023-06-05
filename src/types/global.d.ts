declare global {
  interface window {
    getSelection: () => Selection | null;
  }
}
