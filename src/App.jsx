import Optin from './components/Optin/Optin';
import Preloader from './components/Preloader/Preloader';

function App() {
  return (
    <div class="App">
      <div className="container">
        <h1>
          Website
          <br />
          Coming Soon
        </h1>

        <Optin />
        <Preloader />
      </div>
    </div>
  );
}

export default App;
