document.addEventListener("DOMContentLoaded", function () {
    const SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbx6nAaKUOAE8GMp3u0zb3EAtps9nrMnB7pSaLTlQh9-vVndf4D3RabtpvLu8_wiXDHm/exec";

    const attendanceInputs = document.querySelectorAll(
        'input[name="attendance"]'
    );

    const guestFields =
        document.getElementById("guest-fields");

    const rsvpForm =
        document.getElementById("rsvp-form");

    const formStatus =
        document.getElementById("form-status");

    const submitButton =
        rsvpForm.querySelector(".submit-button");

    const guestNameInput =
        document.getElementById("guest-name");

    const guestCountSelect =
        document.getElementById("guest-count");

    const childCountSelect =
        document.getElementById("child-count");

    const messageInput =
        document.getElementById("message");

    const thankYouMessage =
        document.getElementById("thank-you-message");

    const thankYouIcon =
        document.getElementById("thank-you-icon");

    const thankYouTitle =
        document.getElementById("thank-you-title");

    const thankYouText =
        document.getElementById("thank-you-text");

    const closeThankYouButton =
        document.getElementById("close-thank-you");


    /*
     * IGEN / NEM VÁLASZTÁS
     */

    attendanceInputs.forEach(function (input) {
        input.addEventListener("change", function () {
            clearStatus();

            if (this.value === "igen") {
                guestFields.classList.add("visible");
            }

            if (this.value === "nem") {
                guestFields.classList.remove("visible");
            }
        });
    });


    /*
     * GYERMEKLÉTSZÁM
     */

    guestCountSelect.addEventListener("change", function () {
        updateChildOptions(Number(this.value));
    });


    /*
     * ŰRLAP ELKÜLDÉSE
     */

    rsvpForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        clearStatus();

        const attendance = document.querySelector(
            'input[name="attendance"]:checked'
        );

        if (!attendance) {
            showError(
                "Kérjük, jelöljétek meg, hogy részt vesztek-e."
            );

            return;
        }

        let guestName = "";
        let guestCount = "";
        let childCount = "0";
        let room = "";
        let message = "";

        if (attendance.value === "igen") {
            guestName = guestNameInput.value.trim();
            guestCount = guestCountSelect.value;
            childCount = childCountSelect.value || "0";
            message = messageInput.value.trim();

            const selectedRoom = document.querySelector(
                'input[name="room"]:checked'
            );

            room = selectedRoom
                ? selectedRoom.value
                : "";

            if (!guestName) {
                showError(
                    "Kérjük, adjátok meg a nevet."
                );

                guestNameInput.focus();
                return;
            }

            if (!guestCount) {
                showError(
                    "Kérjük, válasszátok ki a létszámot."
                );

                guestCountSelect.focus();
                return;
            }

            if (!room) {
                showError(
                    "Kérjük, jelöljétek meg, hogy szükségetek van-e vendégszobára."
                );

                return;
            }

            if (Number(childCount) > Number(guestCount)) {
                showError(
                    "A gyermekek száma nem lehet több a teljes létszámnál."
                );

                return;
            }
        }

        const formData = {
            attendance: attendance.value,
            guestName: guestName,
            guestCount: guestCount,
            childCount: childCount,
            room: room,
            message: message
        };

        setLoading(true);

        try {
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify(formData)
            });


            /*
             * FELUGRÓ ABLAK SZÖVEGE
             */

            if (attendance.value === "igen") {
                thankYouMessage.classList.remove("decline");

                thankYouIcon.textContent = "✓";

                thankYouTitle.textContent =
                    "Köszönjük a visszajelzést!";

                thankYouText.textContent =
                    "Örülünk, hogy velünk ünnepeltek. Szeretettel várunk benneteket Nimród keresztelőjén!";
            } else {
                thankYouMessage.classList.add("decline");

                thankYouIcon.textContent = "♥";

                thankYouTitle.textContent =
                    "Sajnáljuk, hogy nem lehettek velünk!";

                thankYouText.textContent =
                    "Köszönjük, hogy visszajeleztetek. Reméljük, hamarosan egy másik alkalommal együtt ünnepelhetünk!";
            }

            resetForm();

            thankYouMessage.classList.add("visible");

        } catch (error) {
            console.error("Küldési hiba:", error);

            showError(
                "A visszajelzést most nem sikerült elküldeni. Kérjük, próbáljátok meg újra."
            );

        } finally {
            setLoading(false);
        }
    });


    /*
     * FELUGRÓ ABLAK BEZÁRÁSA
     */

    closeThankYouButton.addEventListener(
        "click",
        closeThankYouAndReturnToTop
    );


    thankYouMessage.addEventListener(
        "click",
        function (event) {
            if (event.target === thankYouMessage) {
                closeThankYouAndReturnToTop();
            }
        }
    );


    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Escape" &&
                thankYouMessage.classList.contains("visible")
            ) {
                closeThankYouAndReturnToTop();
            }
        }
    );


    /*
     * SEGÉDFÜGGVÉNYEK
     */

    function updateChildOptions(totalGuests) {
        childCountSelect.innerHTML = "";

        if (!totalGuests) {
            childCountSelect.disabled = true;

            const option =
                document.createElement("option");

            option.value = "";

            option.textContent =
                "Előbb válassz létszámot";

            childCountSelect.appendChild(option);

            return;
        }

        childCountSelect.disabled = false;

        for (
            let childCount = 0;
            childCount <= totalGuests;
            childCount++
        ) {
            const option =
                document.createElement("option");

            option.value = String(childCount);

            option.textContent =
                childCount === 0
                    ? "Nincs 10 év alatti gyermek"
                    : `${childCount} gyermek`;

            childCountSelect.appendChild(option);
        }
    }


    function setLoading(isLoading) {
        submitButton.disabled = isLoading;

        submitButton.textContent = isLoading
            ? "Küldés folyamatban..."
            : "Visszajelzés elküldése";
    }


    function showError(message) {
        formStatus.textContent = message;

        formStatus.classList.add("error");
        formStatus.classList.remove("success");
    }


    function clearStatus() {
        formStatus.textContent = "";

        formStatus.classList.remove(
            "success",
            "error"
        );
    }


    function resetForm() {
        rsvpForm.reset();

        guestFields.classList.remove("visible");

        childCountSelect.disabled = true;

        childCountSelect.innerHTML =
            '<option value="">Előbb válassz létszámot</option>';
    }


    function closeThankYouAndReturnToTop() {
        thankYouMessage.classList.remove("visible");

        setTimeout(function () {
            document
                .getElementById("top")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        }, 250);
    }
});