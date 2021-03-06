import { ExcalidrawElement } from "./element/types";

class SceneHistory {
  private recording: boolean = true;
  private stateHistory: string[] = [];
  private redoStack: string[] = [];

  generateCurrentEntry(elements: readonly ExcalidrawElement[]) {
    return JSON.stringify(
      elements.map(element => ({ ...element, isSelected: false }))
    );
  }

  pushEntry(newEntry: string) {
    if (
      this.stateHistory.length > 0 &&
      this.stateHistory[this.stateHistory.length - 1] === newEntry
    ) {
      // If the last entry is the same as this one, ignore it
      return;
    }
    this.stateHistory.push(newEntry);
  }

  restoreEntry(entry: string) {
    // When restoring, we shouldn't add an history entry otherwise we'll be stuck with it and can't go back
    this.skipRecording();

    try {
      return JSON.parse(entry);
    } catch {
      return null;
    }
  }

  clearRedoStack() {
    this.redoStack.splice(0, this.redoStack.length);
  }

  redoOnce(elements: readonly ExcalidrawElement[]) {
    const currentEntry = this.generateCurrentEntry(elements);
    const entryToRestore = this.redoStack.pop();
    if (entryToRestore !== undefined) {
      this.stateHistory.push(currentEntry);
      return this.restoreEntry(entryToRestore);
    }

    return null;
  }

  undoOnce(elements: readonly ExcalidrawElement[]) {
    const currentEntry = this.generateCurrentEntry(elements);
    let entryToRestore = this.stateHistory.pop();

    // If nothing was changed since last, take the previous one
    if (currentEntry === entryToRestore) {
      entryToRestore = this.stateHistory.pop();
    }
    if (entryToRestore !== undefined) {
      this.redoStack.push(currentEntry);
      return this.restoreEntry(entryToRestore);
    }

    return null;
  }

  isRecording() {
    return this.recording;
  }

  skipRecording() {
    this.recording = false;
  }

  resumeRecording() {
    this.recording = true;
  }
}

export const createHistory: () => { history: SceneHistory } = () => {
  const history = new SceneHistory();
  return { history };
};
