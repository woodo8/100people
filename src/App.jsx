import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Grid, Card, CardMedia, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import famousPeople from "./famousPeople.json"; // JSON file with famous people
import { CircularProgress } from "@mui/material";

import "./App.css";

const App = () => {
  const [level, setLevel] = useState(1);
  const [options, setOptions] = useState([]);
  const [correctPerson, setCorrectPerson] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30); // Timer starts with 30 seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [mistakes, setMistakes] = useState(3); // Allow 3 mistakes
  const [gameOver, setGameOver] = useState(false); // Track game over state
  const [usedPeople, setUsedPeople] = useState([]); // Track people already used as correct answers
  const [loading, setLoading] = useState(false);


  function findDuplicateNames(dataArray) {
    const nameCounts = {};
    const duplicates = [];

    // Count occurrences of each name
    dataArray.forEach(entry => {
      const name = entry.name;
      if (nameCounts[name]) {
        nameCounts[name]++;
      } else {
        nameCounts[name] = 1;
      }
    });

    // Find names that appear more than once
    for (const [name, count] of Object.entries(nameCounts)) {
      if (count > 1) {
        duplicates.push(name);
      }
    }

    return duplicates;
  }
  function removeDuplicatesByName(dataArray) {
    const seenNames = new Set();
    return dataArray.filter(entry => {
      if (seenNames.has(entry.name)) {
        return false; // Skip duplicate
      } else {
        seenNames.add(entry.name);
        return true; // Keep unique entry
      }
    });
  }


  useEffect(() => {
    console.log(findDuplicateNames(famousPeople));
    console.log(removeDuplicatesByName(famousPeople));
  }, []);

  useEffect(() => {
    if (!gameOver) {
      if (level > 30) {
        alert("Congratulations! You completed all 30 levels!");
        setGameOver(true);
      } else {
        loadLevel();
      }
    }
  }, [level, gameOver]);

  useEffect(() => {
    let timer;
    console.log("im working")
    if (isTimerRunning && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeOut(); // Handle timeout when time runs out
            return 30; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
    } else {

    }
    return () => clearInterval(timer);
  }, [isTimerRunning, gameOver,timeLeft]);

  const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };

  const loadLevel = async () => {
    setLoading(true)
    const remainingPeople = famousPeople.filter(
      (person) => !usedPeople.some((used) => used.name === person.name)
    );

    if (remainingPeople.length < 8) {
      alert("Not enough unique people left for another round.");
      setGameOver(true);
      return;
    }

    shuffleArray(remainingPeople); // Shuffle the array of remaining people
    console.log("remaining people", remainingPeople)
    const selectedOptions = remainingPeople.slice(0, 8); // Select exactly 6 unique people

    // Ensure we have exactly 6 options
    // if (selectedOptions.length !== 6) {
    //   console.error("Unexpected number of options. Expected 6, but got:", selectedOptions.length);
    //   return;
    // }
    const optionsWithImages = await Promise.all(
      selectedOptions.map(async (person) => {
        const imageUrl = await fetchWikipediaImage(person.name);
        return { ...person, imageUrl }; // Add image URL to person object
      })
    );

    // const correctAnswer = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];

    const correctAnswer = optionsWithImages[Math.floor(Math.random() * optionsWithImages.length)];

    // setOptions(selectedOptions); // Replace the old options with the new ones
    setOptions(optionsWithImages); // Replace the old options with the new ones
    setCorrectPerson(correctAnswer); // Set the correct person for the round
    setUsedPeople([...usedPeople, correctAnswer]); // Add the correct answer to the used list
    setTimeLeft(30); // Reset timer for each level
    setIsTimerRunning(true); // Restart the timer
    setLoading(false)
  };

  const handleGuess = (person) => {
    setLoading(true); //start the loader
    try {
      if (person.name === correctPerson.name) {
        setLevel(level + 1);
      } else {
        handleMistake();
      }
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const handleMistake = () => {
    if (mistakes > 1) {
      setMistakes(mistakes - 1);
      alert("Wrong answer! Try again.");
    } else {
      setGameOver(true);
      alert("Game Over! You've used all your mistakes.");
    }
  };

  const handleTimeOut = () => {
    if (mistakes > 1) {
      setMistakes(mistakes - 1);
      alert("Time's up! Mistake count reduced.");
      setTimeLeft(30); // Reset timer for the next round
      setIsTimerRunning(true); // Restart the timer
    } else {
      setGameOver(true);
      alert("Game Over! You've used all your mistakes.");
    }
  };

  const handleRestart = () => {
    setLevel(1);
    setMistakes(3);
    setGameOver(false);
    setTimeLeft(30);
    setIsTimerRunning(true);
    setUsedPeople([]);
  };

  useEffect(() => {
    if (gameOver) {
      handleRestart(); // Reset all game state
    }
  }, [gameOver]);

  const fetchWikipediaImage = async (personName) => {
    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(personName)}`);
      const data = await response.json();

      if (data.thumbnail && data.thumbnail.source) {
        return data.thumbnail.source; // URL to the person's image
      } else {
        return "https://via.placeholder.com/200"; // Default image if no thumbnail is available
      }
    } catch (error) {
      console.error("Error fetching Wikipedia image:", error);
      return "https://via.placeholder.com/200"; // Default image on error
    }
  };



  return (
    <Container maxWidth="md" style={{ textAlign: "center", padding: "20px", marginTop:"20px",marginBottom:"20px",backgroundColor: "#121212", color: "#fff" }}>
      <Typography variant="h4" gutterBottom style={{ fontFamily: "Poppins, sans-serif" }}>
        Guess the Famous Person
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ borderBottom: 5, paddingBottom: 1 }}>
        Round: {level} / 30 | Score: {level - 1}
      </Typography>
      {loading ? (
        <CircularProgress color="primary" />
      ) : (
        <Typography variant="h1" gutterBottom style={{ fontSize: "38px" }}>
          {correctPerson && `${correctPerson.description} (${correctPerson.country})`}
        </Typography>
      )}

      <Grid container spacing={0} justifyContent="center">
        {options.map((person) => (
          <Grid item xs={6} sm={3} key={person.name}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {loading ? (
                <CircularProgress color="primary" />
              ) : (
                <Card className="cardItem" onClick={() => handleGuess(person)} style={{ cursor: "pointer"}} variant="outlined">
                  <CardMedia
                    component="img"
                    image={person.imageUrl}
                    // image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStPEZrm1-iMvr9-iBOcyn30txTUalXEGsTBw&s"
                    alt={person.name}
                    style={{ height: "200px", objectFit: "cover", objectPosition:"center" }}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" style={{ color: "#fff" }}>
                      {person.name}
                    </Typography>
                  </CardContent>
                </Card>)}
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Bottom row */}
      <Grid container spacing={2} justifyContent="space-between" style={{ marginTop: "20px" }}>
        <Grid item xs={4} style={{ textAlign: "center", color: "#fff" }}>
          <Typography variant="h6">Mistakes Left: {mistakes}</Typography>
        </Grid>
        <Grid item xs={4} style={{ textAlign: "center" }}>
          <Typography variant="h4" style={{ fontFamily: "Poppins, sans-serif", color: "#fff" }}>
            PEOPLE
          </Typography>
        </Grid>
        <Grid item xs={4} style={{ textAlign: "center", color: "#fff" }}>
          <Typography variant="h6">Time Left: {timeLeft}s</Typography>
        </Grid>
      </Grid>

      {/* Restart Button */}
      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "20px" }}
        onClick={handleRestart}
      >
        Restart Game
      </Button>
    </Container>
  );
};

export default App;
