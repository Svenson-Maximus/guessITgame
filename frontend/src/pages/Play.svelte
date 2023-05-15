<script>
  import { onMount } from "svelte";
  import { jwt_token } from "../store";
  import axios from "axios";
  import Countup from "svelte-countup";

  let allQuestions = []; // Array to store all questions
  let questions = []; // Array to store filtered questions
  let userAnswer = "";
  let playerDetails;
  let playerLevel;
  let currentQuestionIndex = 0;
  let levelCompleted = false;

  let playerId;
  let correctAnswer = null;
  let showNextButton = false;
  let score = 0;
  let questionScore = 0;

  let countdown;
  let timer = 60;

  let isLoading = true;

  const api_root = window.location.origin;

  onMount(async () => {
    try {
      await getPlayerDetails();
      await getQuestions();
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  });

  async function getPlayerDetails() {
    var config = {
      method: "get",
      url: api_root + "/api/me/player",
      headers: { Authorization: "Bearer " + $jwt_token },
    };

    try {
      const response = await axios(config);
      playerDetails = response.data;
      playerLevel = response.data.playerLevelState;
      playerId = response.data.id;

      console.log("playerDetails:", playerDetails);
    } catch (error) {
      alert("Could not get Player associated to current user");
      console.log(error);
    }
  }

  async function getQuestions() {
    var config = {
      method: "get",
      url: api_root + "/api/question",
      headers: { Authorization: "Bearer " + $jwt_token },
    };

    try {
      const response = await axios(config);

      allQuestions = response.data;

      // Handle the case when answeredQuestions is null
      const answeredQuestionIds = playerDetails.answeredQuestions
        ? playerDetails.answeredQuestions.map((q) => q.questionId)
        : [];

      questions = allQuestions
        .filter((question) => question.level === playerLevel)
        .filter((question) => !answeredQuestionIds.includes(question.id));

      //console.log
      console.log("Answered question IDs:", answeredQuestionIds);
      console.log("Player level:", playerLevel);
      console.log("All questions:", allQuestions);

      console.log("Filtered questions for level", playerLevel, ":", questions);

      isLoading = false;
      startTimer();
    } catch (error) {
      alert("Could not get questions");
      console.log(error);
    }
  }

  function startTimer() {
    countdown = setInterval(() => {
      timer--;

      if (timer <= 0) {
        clearInterval(countdown);
        timer = 0;
        handleSubmit();
      }
    }, 1000);
  }

  function resetTimer() {
    clearInterval(countdown);
    timer = 60;
  }

  function handleNextQuestion() {
    userAnswer = ""; // clear the input
    showNextButton = false;
    correctAnswer = null;
    currentQuestionIndex++; // move to the next question

    console.log("currentQuestionIndex:" + currentQuestionIndex);

    // If the player has answered all the questions, update the level
    if (currentQuestionIndex >= questions.length) {
      levelCompleted = true;
      currentQuestionIndex = 0;
      updatePlayerLevel();
    } else {
      resetTimer();
      startTimer();
    }
  }

  async function handleSubmit() {
    const scores = await submitAnswer();
    console.log("QuestionScore: " + score);
    score = scores.score;
    questionScore = scores.questionScore;
    correctAnswer = questions[currentQuestionIndex].correctAnswer;
    showNextButton = true;
  }

  async function submitAnswer() {
    const config = {
      method: "post",
      url: `${api_root}/api/player/answer`,
      headers: {
        "Player-Id": playerDetails.id,
        Authorization: `Bearer ${$jwt_token}`,
        "Content-Type": "application/json",
      },
      data: {
        questionId: questions[currentQuestionIndex].id,
        playerAnswer: userAnswer,
      },
    };

    try {
      const response = await axios(config);
      playerDetails = response.data;
      userAnswer = "";
      const answeredQuestions = response.data.answeredQuestions;
      if (answeredQuestions && answeredQuestions.length > 0) {
        questionScore =
          answeredQuestions[answeredQuestions.length - 1].questionScore;
      } else {
        questionScore = 0; // Default value when there are no answered questions
      }
      return { score: response.data.score, questionScore };
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  }

  async function updatePlayerLevel() {
    const playerLeveStateDTO = {
      level: getNextLevel(playerLevel), // Update the player's level
    };

    const config = {
      method: "put",
      url: `${api_root}/api/player/levelstate`,
      headers: {
        "Player-Id": playerId,
        Authorization: `Bearer ${$jwt_token}`,
        "Content-Type": "application/json",
      },
      data: playerLeveStateDTO,
    };

    try {
      const response = await axios(config);
      playerDetails = response.data; // Update playerDetails with the updated player returned from the server
      playerLevel = playerDetails.playerLevelState; // Update the player's level in our local state
    } catch (error) {
      console.error("Failed to update player level:", error);
    }
  }

  function getNextLevel(currentLevel) {
    const levels = [
      "LEVEL_1",
      "LEVEL_2",
      "LEVEL_3",
      "LEVEL_4",
      "LEVEL_5",
      "LEVEL_6",
      "LEVEL_7",
      "COMPLETED",
    ];
    const currentIndex = levels.indexOf(currentLevel);

    return levels[currentIndex + 1];
  }

  function redirectToLeaderboard() {
    window.location.assign("#/leaderboards");
  }
  function redirectToHome() {
    window.location.assign("#/home");
  }
</script>

<div class="container">
  <div class="row">
    <div class="col-md-12 text-center">
      {#if levelCompleted}
        <h2>Level Completed!</h2>
        <button on:click={redirectToHome} class="btn btn-primary">Home</button>
        <button on:click={redirectToLeaderboard} class="btn btn-primary"
          >Leaderboard</button
        >
      {:else if questions.length > 0 && currentQuestionIndex < questions.length}
        <div class="question-box">
          <h2>{questions[currentQuestionIndex].questionText}</h2>
        </div>

        {#if !showNextButton}
          <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group answer-input">
              <input
                class="form-control"
                type="number"
                bind:value={userAnswer}
                placeholder="Enter your answer here"
                min="0"
                step="1"
              />
              <p>Time remaining:</p>
              <h2>{timer}</h2>
              <button type="submit" class="btn btn-primary">Submit</button>
            </div>
          </form>
        {:else}
          <div class="answerClass">
            <p>The correct answer was: {correctAnswer}</p>
            <p>You gained: </p>
            <div class="question-score">
              <Countup
                initial={0}
                value={questionScore}
                duration={1000}
                step={1}
                roundto={1}
                format={true}
              /> Points
            </div>
            <p>Your Highscore now is:</p>
            <div class="highscore">
              {score}
            </div>
          </div>
          <button on:click={handleNextQuestion} class="btn btn-primary"
            >Next</button
          >
        {/if}
      {:else if isLoading}
        <div class="loader-container">
          <div class="loader" />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 100%;
    padding: 3rem 1rem;
  }

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  form {
    margin-bottom: 1rem;
  }

  .btn-primary {
    font-family: "Arial Black", Arial, sans-serif;
    font-size: 24px;
    padding: 16px 32px;
    background-color: #45a3f7;
    color: #ffffff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 50px;
  }

  .btn-primary:hover {
    box-shadow: 0px 0px 100px 0px rgba(251, 44, 237, 0.75);
    color: rgb(62, 17, 209);
  }

  .loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .loader {
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .answerClass {
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 0.5rem;
    margin-top: 10px;
  }

  .highscore {
    font-size: 2.5rem;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 0.5rem;
    margin-top: 10px;
  }

  .question-box {
    display: inline-block;
    padding: 1rem;
    border: 3px solid white;
    border-radius: 5px;
  }

  .answer-input {
    margin-top: 10px;
  }

  .question-score {
    font-size: 4rem; 
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 0.5rem;
    margin-top: 10px;
  }
</style>
