console.log("Updated Script: Relative Path Mode");

let songs;
let songs2 = [];
let currfolder;
let currentSong = new Audio();

function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return String(minutes).padStart(2, '0') + ':' + String(remainingSeconds).padStart(2, '0');
}

// 1. Updated getSongs to use relative pathing

 async function getSongs(folder) {
    // 1. Set the global folder variable correctly
    currfolder = folder; 
    
    try {
        // 2. Fetch the JSON map
        let a = await fetch(`./songs/songs.json`);
        let songsData = await a.json();

        // 3. Extract just the artist folder name (e.g., "dhurandhar")
        let folderName = folder.split("/").slice(-1)[0];
        
        // 4. Check if this artist exists in your JSON
        if (!songsData[folderName]) {
            console.error(`Folder "${folderName}" not found in songs.json. Available:`, Object.keys(songsData));
            return [];
        }

        songs = songsData[folderName];
        songs2 = songs;

        // 5. Build the list in the UI
        let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUl.innerHTML = "";
        for (const song of songs) {
            songUl.innerHTML += `<li>
                                <img class="invert" src="music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div></div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert playnowd" src="play.svg" alt="">
                                </div>
                            </li>`;
        }

        // 6. Add click listeners to the new list items
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            });
        });

        return songs;

    } catch (error) {
        console.error("Critical Error in getSongs:", error);
        return [];
    }
}

// 2. Updated playMusic for relative folder pathing
const playMusic = (track, pause = false) => {
    // This points to ./songs/folder_name/track.mp3
    currentSong.src = `./${currfolder}/${track}`;
    
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// 3. Updated displayalbums to use relative pathing
async function displayalbums() {
    let a = await fetch(`./songs/songs.json`);
    let songsData = await a.json();
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (const folder in songsData) {
        try {
            let infoFetch = await fetch(`./songs/${folder}/info.json`);
            let response = await infoFetch.json();

            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="./songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        } catch (error) {
            console.error("Error loading info.json for " + folder, error);
        }
    }

    // Event listener for Album Cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs2[0]);
        });
    });
}

async function main() {
    // Initial Load - Starting with Dhurandhar
    // Note: Make sure the folder name matches exactly (case sensitive)
    await getSongs("songs/Dhurandhar");
    playMusic(songs2[0], true);
    
    await displayalbums();

    // UI Controls (Play/Pause/Seek/Volume)
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutes(currentSong.currentTime)}/${secondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

   previous.addEventListener("click", () => {
    let currentSongName = currentSong.src.split("/").slice(-1)[0];
    let index = songs2.indexOf(currentSongName);

    console.log("Previous Clicked. Current Index:", index);

    if ((index - 1) >= 0) {
        playMusic(songs2[index - 1]);
    } else {
        console.log("Start of playlist");
    }
})

    next.addEventListener("click", () => {
    // This gets just the filename (e.g., "song1.mp3") from the full URL
    let currentSongName = currentSong.src.split("/").slice(-1)[0];
    console.log("THis is name inside next "+currentSongName);
    let index = songs2.indexOf(currentSongName);

    console.log("Next Clicked. Current Index:", index);

    if ((index + 1) < songs2.length) {
        playMusic(songs2[index + 1]);
    } else {
        console.log("End of playlist");
    }
})

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });
}

main();
