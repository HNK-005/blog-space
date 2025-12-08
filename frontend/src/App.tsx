import { Button } from './components/ui/button';

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl text-red-500">Hello Blogspace!</h1>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button variant="destructive" size="lg">
          Click me
        </Button>
      </div>
    </div>
  );
}

export default App;
