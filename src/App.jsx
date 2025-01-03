import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Grid, Card, CardMedia, CardContent, LinearProgress, CircularProgress, Box } from "@mui/material";
import { motion } from "framer-motion";
import famousPeople from "./famousPeople.json";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';


import "./App.css";
import AnimatedAlert from "./components/alerts";
import CongratulationsModal from "./components/congratsModal";

const App1 = () => {
    const [level, setLevel] = useState(1);
    const [options, setOptions] = useState([]);
    const [correctPerson, setCorrectPerson] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [mistakes, setMistakes] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [usedPeople, setUsedPeople] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCongratulations, setShowCongratulations] = useState(false);

    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: "",
    });

    const showAlert = (severity, message) => {
        setAlert({ open: true, severity, message });
    };
    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };


    const shuffleArray = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    };

    useEffect(() => {
        if (!gameOver) {
            if (level > 30) {
                showAlert("success", "Congratulations! You completed all 30 levels!");
                setShowCongratulations(true);
                setGameOver(true);
            } else {
                loadLevel();
            }
        } else {
            // handleRestart();
        }
    }, [level, gameOver]);

    useEffect(() => {
        let timer;
        if (isTimerRunning && !gameOver) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleTimeOut();
                        return 30;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, gameOver, timeLeft]);

    const loadLevel = async () => {
        setLoading(true);
        const remainingPeople = famousPeople.filter(
            (person) => !usedPeople.some((used) => used.name === person.name)
        );

        if (remainingPeople.length < 8) {
            showAlert("warning", "Not enough unique people left for another round.");
            setGameOver(true);
            return;
        }

        shuffleArray(remainingPeople);
        const selectedOptions = remainingPeople.slice(0, 8);

        const optionsWithImages = await Promise.all(
            selectedOptions.map(async (person) => {
                const imageUrl = await fetchWikipediaImage(person.name);
                return { ...person, imageUrl };
            })
        );

        const correctAnswer = optionsWithImages[Math.floor(Math.random() * optionsWithImages.length)];

        setOptions(optionsWithImages);
        setCorrectPerson(correctAnswer);
        setUsedPeople([...usedPeople, correctAnswer]);
        setTimeLeft(30);
        setIsTimerRunning(true);
        setLoading(false);
    };

    const handleGuess = (person) => {
        setLoading(true);
        try {
            if (person.name === correctPerson.name) {
                setLevel(level + 1);
            } else {
                handleMistake();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMistake = () => {
        if (mistakes > 1) {
            setMistakes(mistakes - 1);
            showAlert("warning", "Wrong answer! Try again.");
        } else {
            setGameOver(true);
            showAlert("error", "Game Over! You've used all your mistakes.");
        }
    };

    const handleTimeOut = () => {
        if (mistakes > 1) {
            setMistakes(mistakes - 1);
            showAlert("warning", "Time's up! Mistake count reduced.");
            setTimeLeft(30); // Reset timer for the next round
            setIsTimerRunning(true); // Restart the timer
        } else {
            setGameOver(true);
            showAlert("error", "Game Over! You've used all your mistakes.");
        }
    };

    const handleRestart = () => {
        setLevel(1);
        setMistakes(3);
        setGameOver(false);
        setTimeLeft(30);
        setIsTimerRunning(true);
        setUsedPeople([]);
        setShowCongratulations(false);
    };

    const fetchWikipediaImage = async (personName) => {
        try {
            const response = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(personName)}`
            );
            const data = await response.json();

            if (data.thumbnail && data.thumbnail.source) {
                return data.thumbnail.source;
            } else {
                return "https://via.placeholder.com/200";
            }
        } catch (error) {
            console.error("Error fetching Wikipedia image:", error);
            return "https://via.placeholder.com/200";
        }
    };
    const renderHearts = () => {
        const hearts = [];
        for (let i = 0; i < 3; i++) {
            if (i < mistakes) {
                hearts.push(<FavoriteIcon key={i} style={{ color: "#ff3366", fontSize: "40px", margin: "0 5px" }} />);
            } else {
                hearts.push(<FavoriteBorderIcon key={i} style={{ color: "#6c4b53", fontSize: "40px", margin: "0 5px" }} />);
            }
        }
        return hearts;
    };


    return (
        <Container
            maxWidth="md"
            style={{
                backgroundColor: "#22223b",
                color: "#333",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0px 8px 20px rgba(0,0,0,0.7)",
                marginTop: "40px",
                marginBottom: "40px",
            }}
        >
            {/* Header */}
            <header style={{ textAlign: "center", marginBottom: "10px" }}>
                <Typography variant="h3" style={{ color: "#fff", fontFamily: "Poppins, sans-serif", fontWeight: "600" }}>
                    Famous Personality Quiz
                </Typography>
                <Typography variant="h6" style={{ color: "#fff", marginTop: "5px" }}>
                    Level: {level} | Score: {level - 1}
                </Typography>

            </header>


            <section>
                <Grid container alignItems="center" spacing={3}>
                    {/* Progress Bar Section */}
                    <Grid item xs={6}>
                        <Box style={{}}>
                            <LinearProgress
                                variant="determinate"
                                value={(level / 30) * 100} // Calculate the progress based on the level
                                className="futuristic-progress-bar"
                            />
                        </Box>
                    </Grid>

                    {/* Hearts Section */}
                    <Grid item xs={6} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                        {renderHearts()}
                    </Grid>
                </Grid>
            </section>

            {/* Question */}
            <section style={{ marginBottom: "10px", textAlign: "center" }}>
                {loading ? (
                    <CircularProgress color="primary" />
                ) : (
                    <Typography
                        className="descriptionOfPerson"
                        variant="h5"
                        style={{ fontFamily: "Roboto, sans-serif", color: "#fff", fontWeight: "500" }}
                    >
                        {correctPerson && `${correctPerson.description} (${correctPerson.country})`}
                    </Typography>
                )}
            </section>
            <section style={{ marginBottom: "10px", textAlign: "center" }}>

                <motion.div
                    key={timeLeft} // Changes the key with every timer update
                    initial={{ scale: 1 }} // Initial scale
                    animate={{ scale: [1, 1.3, 1] }} // Heartbeat effect
                    transition={{
                        duration: 0.6, // Duration of the animation
                        ease: "easeInOut", // Smooth easing
                    }}
                    style={{
                        fontSize: "80px", // Big number
                        fontWeight: "bold", // Bold text
                        color: "#ff3366", // Heartbeat color
                    }}
                >
                    <strong>{timeLeft}</strong>
                </motion.div>
            </section>
            {/* Options */}
            <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} justifyContent="center">
                {options.map((person) => (
                    <Grid item xs={3} sm={3} md={3} key={person.name}>
                        <motion.div whileHover={{ scale: 1.05 }}>
                            {loading ? (
                                <CircularProgress color="primary" />
                            ) : (
                                <Card
                                    onClick={() => handleGuess(person)}
                                    style={{
                                        cursor: "pointer",
                                        borderRadius: "20px",
                                        overflow: "hidden",
                                        boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
                                        transition: "transform 0.3s",
                                        backgroundColor: "black",
                                    }}
                                >
                                    <CardMedia
                                        className="cardMedia"
                                        component="img"
                                        image={person.imageUrl}
                                        alt={person.name}
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />
                                    <CardContent style={{ background: "#465984", textAlign: "center", borderRadius: "20px", padding: "12px" }}>
                                        <Typography
                                            className="nameOfPerson"
                                            variant="subtitle1"
                                            style={{ fontFamily: "Poppins, sans-serif", color: "white", fontSize: "18px" }}
                                        >
                                            {person.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Bottom Section */}
            <section style={{ marginTop: "30px", textAlign: "center", color: "#fff" }}>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ padding: "10px 20px", borderRadius: "20px" }}
                    onClick={handleRestart}
                >
                    Restart Game
                </Button>
            </section>
            <CongratulationsModal
                open={showCongratulations}
                onClose={() => setShowCongratulations(false)}
                onRestart={handleRestart}
            />
            <AnimatedAlert
                open={alert.open}
                severity={alert.severity}
                message={alert.message}
                onClose={handleCloseAlert}
            />
        </Container>
    );
};

export default App1;
