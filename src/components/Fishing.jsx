import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import "./Fishing.css";

const Fishing = () => {
  const [progress, setProgress] = useState(0);
  const [isHeld, setIsHeld] = useState(false);
  const [isReeling, setIsReeling] = useState(false);
  const intervalRef = useRef(null);
  const progressTimerRef = useRef(null);
  const progressUpdatedRef = useRef(false);
  const progressIndicatorRemoveDelay = 1000;
  const fishMovementRef = useRef(null);
  const baitTimerRef = useRef(null);
  const baitRef = useRef(null);
  const fishRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [reelPower, setReelPower] = useState(10);
  const [progressPenalty, setProgressPenalty] = useState(3);
  const [progressIncrement, setProgressIncrement] = useState(2);

  const openSettingsMenu = () => {
    setIsSettingsOpen(true);
  };

  const closeSettingsMenu = () => {
    setIsSettingsOpen(false);
  };

  const randomNumber = (min, max) => Math.random() * (max - min) + min;

  const reset = () => {
    clearInterval(fishMovementRef.current);
    clearInterval(baitTimerRef.current);

    if (fishRef.current) {
      fishRef.current.style.display = "none";
      const depth = parseInt(fishRef.current.dataset.depth) || 100;
      const randomTop = randomNumber(depth * 0.89, 89);

      fishRef.current.style.transition = `top ${
        fishRef.current.dataset.speed || 1000
      }ms linear`;
      fishRef.current.style.top = `${randomTop}%`;

      setTimeout(() => {
        fishRef.current.style.display = "block";
        moveFish();
      }, parseInt(fishRef.current.dataset.speed) || 1000);
    }

    setProgress(0);
    document.querySelector(".fishing .progress .bar").style.height = "0%";
    progressUpdatedRef.current = false;
  };

  const progressbar = (overlapping) => {
    clearTimeout(progressTimerRef.current);
    const progressElement = document.querySelector(".fishing .progress .bar");
    const progressUpdaterate =
      parseInt(document.querySelector(".fishing").dataset.progressupdaterate) ||
      200;
    const progressValue = parseFloat(progressElement.style.height) || 0;
    const progressIncrement =
      parseFloat(document.querySelector(".fishing").dataset.progress) || 2;
    const progressPenalty =
      parseFloat(document.querySelector(".fishing").dataset.progresspenalty) ||
      3;

    if (overlapping) {
      if (progressValue < 100) {
        const newHeight = progressValue + progressIncrement;
        setProgress(Math.min(newHeight, 100));

        progressElement.style.transition = `height ${progressUpdaterate}ms linear`;
        progressElement.style.height = `${newHeight}%`;
      } else {
        console.success("You caught the fish. Good job!!", "Horray!!");
        reset();
      }
    } else {
      if (progressValue > 0) {
        const newHeight = progressValue - progressPenalty;
        setProgress(Math.max(newHeight, 0));

        progressElement.style.transition = `height ${progressUpdaterate}ms linear`;
        progressElement.style.height = `${newHeight}%`;
      }
    }
    progressUpdatedRef.current = false;
  };

  const checkOverlapping = () => {
    const bait = baitRef.current;
    const fish = fishRef.current;

    if (!bait || !fish) return;

    const baitBound = bait.getBoundingClientRect();
    const fishBound = fish.getBoundingClientRect();

    const overlapping = !(
      baitBound.right < fishBound.left ||
      baitBound.left > fishBound.right ||
      baitBound.bottom < fishBound.top ||
      baitBound.top > fishBound.bottom
    );

    if (!progressUpdatedRef.current) {
      progressUpdatedRef.current = true;
      progressTimerRef.current = setTimeout(() => {
        progressbar(overlapping);
        progressUpdatedRef.current = false;
      }, document.querySelector(".fishing").dataset.progressupdaterate || 200);
    }
  };

  const moveBait = (direction) => {
    const bait = baitRef.current;
    if (bait) {
      if (direction === "up") {
        bait.style.transition = "top 3s ease-out";
        bait.style.top = "0%";
      } else if (direction === "down") {
        bait.style.transition = "top 1s ease-in";
        bait.style.top = "76%";
        setTimeout(() => {
          bait.style.top = "79%";
        }, 10);
      }
    }
  };

  const startHolding = () => {
    if (intervalRef.current) return;
    moveBait("up");
    setIsHeld(true);
    intervalRef.current = setInterval(() => {
      checkOverlapping();
    }, 10);
    setIsReeling(true);
  };

  const stopHolding = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsHeld(false);
    moveBait("down");
    setTimeout(() => {
      setProgress(0);
    }, progressIndicatorRemoveDelay);
    setIsReeling(false);
  };

  const moveFish = () => {
    fishMovementRef.current = setInterval(() => {
      if (!fishRef.current) return;

      const currentPosition = parseInt(fishRef.current.style.top) || 0;
      const jumpRange = parseInt(fishRef.current.dataset.jumprange) || 100;
      const moveDirection =
        Math.floor(Math.random() * currentPosition) +
        Math.abs(currentPosition - jumpRange);

      const newTop = moveDirection <= 89 ? moveDirection : 89;

      fishRef.current.style.transition = `top ${
        fishRef.current.dataset.speed || 1000
      }ms linear`;
      fishRef.current.style.top = `${newTop}%`;

      if (newTop <= 0) {
        clearInterval(fishMovementRef.current);
        fishRef.current.style.top = "0%";
      }
    }, parseInt(fishRef.current.dataset.movepremsec) || 1500);
  };

  useEffect(() => {
    document.addEventListener("mousedown", startHolding);
    document.addEventListener("mouseup", stopHolding);
    document.addEventListener("mouseleave", stopHolding);

    moveFish();

    return () => {
      document.removeEventListener("mousedown", startHolding);
      document.removeEventListener("mouseup", stopHolding);
      document.removeEventListener("mouseleave", stopHolding);
      clearInterval(intervalRef.current);
      clearInterval(fishMovementRef.current);
    };
  }, []);

  return (
    <div
    className="fishing"
    data-reelpower={reelPower}
    data-baitweight="1"
    data-progress={progressIncrement}
    data-progresspenalty={progressPenalty}
    data-progressupdaterate="200"
    >
      <div className="rod">
        <div className="reel">
          <div
            className={`handle ${
              isReeling ? (isHeld ? "reelin" : "reelout") : ""
            }`}
          />
        </div>
      </div>
      <div className="sea">
        <div className="area">
          <div className="bait" id="bait" ref={baitRef}></div>
          <div
            className="fish"
            id="fish"
            ref={fishRef}
            style={{ top: "20%" }}
            data-movepremsec="1500"
            data-jumprange="100"
            data-speed="1000"
            data-depth="20"
          >
            <FontAwesomeIcon icon={faFish} />
          </div>
        </div>
      </div>
      <div className="progress">
        <div className="area">
          <div className="bar" style={{ height: `${progress}%` }}></div>
        </div>
      </div>
      <div className="settings-container">
        <button className="settings-button" onClick={openSettingsMenu}>
          ⚙️ Settings
        </button>
        <span className="settings-tooltip">Adjust game settings</span>
      </div>

      {isSettingsOpen && (
        <div className="settings-modal">
          <div className="settings-modal-content">
            <span className="close-button" onClick={closeSettingsMenu}>
              &times;
            </span>
            <h2>Game Settings</h2>
            <div className="setting-item">
              <label>Reel Power: </label>
              <input
                type="number"
                value={reelPower}
                onChange={(e) => setReelPower(Number(e.target.value))}
              />
            </div>
            <div className="setting-item">
              <label>Progress Increment: </label>
              <input
                type="number"
                value={progressIncrement}
                onChange={(e) => setProgressIncrement(Number(e.target.value))}
              />
            </div>
            <div className="setting-item">
              <label>Progress Penalty: </label>
              <input
                type="number"
                value={progressPenalty}
                onChange={(e) => setProgressPenalty(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fishing;
