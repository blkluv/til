/* eslint-disable no-unused-vars */
import {useEffect, useState} from 'react';
import supabase from './supabase';

import './style.css';

const initialFacts = [
  {
    id: 1,
    text: 'A robot built in the late 1990s called Kismet can recognise emotions through human body language and voice tone.',
    source: 'https://www.analyticsinsight.net/10-insightful-facts-you-didnt-know-about-artificial-intelligence/',
    category: 'ai',
    votesInteresting: 24,
    votesMindblowing: 9,
    votesFalse: 4,
    createdIn: 2021,
  },
  {
    id: 2,
    text: 'ERC-20 was proposed by developer Fabin Vogelstellar in 2015 to address the need for a standard within smart contracts on the Ethereum blockchain.',
    source:
      'https://www.investopedia.com/news/what-erc20-and-what-does-it-mean-ethereum/',
    category: 'erc-20',
    votesInteresting: 11,
    votesMindblowing: 2,
    votesFalse: 0,
    createdIn: 2019,
  },
  {
    id: 3,
    text: 'The number of DeFi users worldwide is estimated at 4.87 million in 2022.',
    source: 'https://www.banklesstimes.com/defi-statistics/',
    category: 'defi',
    votesInteresting: 8,
    votesMindblowing: 3,
    votesFalse: 1,
    createdIn: 2015,
  },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('all');

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);
        
      
        // Query for facts
        let factsQuery = supabase.from('facts').select('*');
        if (currentCategory !== 'all') {
          factsQuery = factsQuery.eq('category', currentCategory);
        }
        factsQuery = factsQuery.order('votesInteresting', {ascending: false}).limit(1000);
      
        // Query for users
        const usersQuery = supabase.from('users').select('*');
      
        const {data: facts, error: factsError} = await factsQuery;
        const {data: users, error: usersError} = await usersQuery;
      
        if (!factsError && !usersError) {
          // Combine facts and users data into a single array of objects
          const factsAndUsers = facts.map((fact) => {
            const user = users.find((u) => u.id === fact.userId);
            return {...fact, user};
          });
          setFacts(factsAndUsers);
        } else {
          alert('There was a problem retrieving the facts!');
        }
      
        setIsLoading(false);
      }      
      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading ...</p>;
}

function Header({showForm, setShowForm}) {
  const appTitle = 'Today I Learned';

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="Today I Learned Logo" />
        <h1>{appTitle}</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? 'Close' : 'Share a fact'}
      </button>
    </header>
  );
}

const CATEGORIES = [
  {name: 'ai', color: '#8b5cf6'},
  {name: 'ar', color: '#3b82f6'},
  {name: 'defi', color: '#16a34a'},
  {name: 'erc-20', color: '#14b8a6'},
  {name: 'meta', color: '#eab308'},
  {name: 'nft', color: '#f97316'},
  {name: 'vr', color: '#db2777'},
  {name: 'xr', color: '#ef4444'},
];

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

function NewFactForm({setFacts, setShowForm}) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    // 1. Prevent browser reload
    e.preventDefault();
    console.log(text, source, category);
    // 2. Check if data is valid. If so, create a new fact
    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      // 3. Upload the fact to Supabase and receive the new fact object
      setIsUploading(true);
      const {data, newFact, error} = await supabase
        .from('facts')
        .insert([{text, source, category}])
        .select();
      setIsUploading(false);
      // 4. Add the new fact to the UI: add the fact to state
      if (!error) setFacts((facts) => [newFact[0], ...facts]);
      // 5. Reset input fields
      setText('');
      setSource('');
      setCategory('');
      // 6. Close the form
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        value={source}
        type="text"
        placeholder="Trustworthy source..."
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({setCurrentCategory}) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory('all')}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              onClick={() => setCurrentCategory(cat.name)}
              style={{backgroundColor: cat.color}}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({facts, setFacts}) {
  if (facts.length === 0)
    return (
      <p className="message">
        Currently there's no facts for this category yet! Create the first one!
        😊
      </p>
    );

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database. Add your own! </p>
    </section>
  );
}

function Fact({fact, setFacts}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed = fact.votesInteresting < fact.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const {data: updatedFact, error} = await supabase
      .from('facts')
      .update({[columnName]: fact[columnName] + 1})
      .eq('id', fact.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[⛔️ DISPUTED]</span> : null}
        {fact.text}
        <a
          className="source"
          href={fact.source}
          target="_blank"
          rel="noreferrer"
        >
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            ?.color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote('votesInteresting')}
          disabled={isUpdating}
        >
          💜 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote('votesMindblowing')}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote('votesFalse')} disabled={isUpdating}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
