// Get the form and result area from the HTML document
const gradeForm = document.getElementById('gradeForm');
const result = document.getElementById('result');

// Get the table body element where the results will be displayed
const studentTableBody = document.getElementById('studentTableBody');

// Load previously saved students or created an empty array 
let students = [];

try{
    // Retrieve previously saved student records 
    const savedStudents = localStorage.getItem('students');

    // Check whether saved records exist 
    if (savedStudents !== null) {

       // Convert the saved JSON into Javascript data 
       const parsedStudents = JSON.parse(savedStudents);

       
    // Make sure the saved data is an array
    if (Array.isArray(parsedStudents)) {

        // Keep only student records with valid information
        students = parsedStudents.filter(function(student) {

            // Check that the student is an object
            if (student === null || typeof student !== 'object') {
                return false;
            }

            // Check that the student's name is valid
            if (
                typeof student.name !== 'string' ||
                student.name.trim() === ''
            ) {
                return false;
            }

            // Check that the three assessment scores are valid
            const validScores = [
                student.assessment1,
                student.assessment2,
                student.assessment3
            ].every(function(score) {
                return typeof score === 'number' &&
                       Number.isFinite(score) &&
                       score >= 0 &&
                       score <= 100;
            });

            if (!validScores) {
                return false;
            }

            // Check that the calculated values are valid
            if (
                typeof student.averageScore !== 'number' ||
                !Number.isFinite(student.averageScore) ||
                typeof student.grade !== 'string' ||
                typeof student.status !== 'string' ||
                typeof student.highestScore !== 'number' ||
                !Number.isFinite(student.highestScore) ||
                typeof student.lowestScore !== 'number' ||
                !Number.isFinite(student.lowestScore)
            ) {
                return false;
            }

            // Keep this student if all checks pass
            return true;
        });
    }


    }       
} catch (error) {

    //Report invalid saved data without crashing the tracker
    console.error('Error loading saved students:', error);
} 

// Remember which student is currently being edited
let editingStudent = null;

// Run this code when the form is submitted
gradeForm.addEventListener('submit', function(event) {
    
    // Prevent the form from submitting normally
    event.preventDefault(); 

    // Get the students name 
    const studentName = document.getElementById('studentName').value.trim();

    // Get the assessment input fields
    const assessment1Input = document.getElementById('assessment1').value;
    const assessment2Input = document.getElementById('assessment2').value;
    const assessment3Input = document.getElementById('assessment3').value;

    // Check that all assessment fields have been completed
    if (
        assessment1Input === '' ||
        assessment2Input === '' ||
        assessment3Input === ''
    ) {
        result.innerHTML = '<p class="error">Please enter all assessment scores.</p>';
        return;
    }
    
    // Convert the assessment input values to numbers
    const assessment1 = Number(assessment1Input);
    const assessment2 = Number(assessment2Input);
    const assessment3 = Number(assessment3Input);

    // Check that the student name has been entered
    if (studentName === '') {
        result.innerHTML = '<p class="error">Please enter the student\'s name.</p>';
        return;
    }

 // --- Prevent Duplicate Student Names ---

// Check whether another student already has this name
const duplicateStudent = students.some(function(student) {
    return student.name.toLowerCase() === studentName.toLowerCase()
        && student !== editingStudent;
});

// Stop the form if the student already exists
if (duplicateStudent) {
    result.innerHTML = '<p class="error">A student with this name already exists.</p>';
    return;
}

    //Check that all assessment scores are between 0 and 100
    if(
       assessment1 < 0 || assessment1 > 100 ||
       assessment2 < 0 || assessment2 > 100 ||
       assessment3 < 0 || assessment3 > 100
    ) {
        result.innerHTML = '<p class="error">Please enter valid assessment scores between 0 and 100.</p>';
        return;
    }

    // Calculate the average score
    const averageScore = (assessment1 + assessment2 + assessment3) / 3;

    // work out the students grade based on the average score
    let grade;
    if (averageScore >= 90) {
        grade = 'A';
    } else if (averageScore >= 80) {
        grade = 'B';
    } else if (averageScore >= 70) {
        grade = 'C';
    } else if (averageScore >= 60) {
        grade = 'D';
    } else if (averageScore >= 50) {
        grade = 'E';
    } else {
        grade = 'F';
    }

    //Work out the students pass/fail status based on the average score
    let status;
    if (averageScore >= 60) {
        status = 'Pass';
    } else {
        status = 'Fail';
    }

    // Find the highest and lowest assesment scores 
    const highestScore = Math.max(assessment1, assessment2, assessment3);
    const lowestScore = Math.min(assessment1, assessment2, assessment3);

    // Store all of the students information in one object 
    const student = {
        name: studentName,
        assessment1: assessment1,
        assessment2: assessment2,
        assessment3: assessment3,
        averageScore: averageScore,
        grade: grade,
        status: status,
        highestScore: highestScore,
        lowestScore: lowestScore
    };

    // Check whether we are editing an existing student
    if (editingStudent !== null ) { 

        //find the original student in the array
        const studentIndex = students.indexOf(editingStudent);

        // replace the orginal studenst with the updated details
        if (studentIndex !== -1) {
            students[studentIndex] = student;
        }

        //stop editing 
        editingStudent = null;
        
        //update the button text
        gradeForm.querySelector('button[type="submit"]').textContent = 'Calculate Average';

    } else {
        // Add the new student to the array of students
        students.push(student);
    }

    // Save the updated array of students to local storage
    localStorage.setItem('students', JSON.stringify(students));

     // Display students using the selected sorting order
    sortStudentResults();

    // Update the dashboard after adding or editing a student
    updateDashboard();

    //Display the students calculated results 
    result.innerHTML = `
    <div class="success">
        <h2 id="resultsStudentName"></h2>
        <p><strong>Average Score:</strong> ${averageScore.toFixed(2)}%</p>
        <p><strong>Grade:</strong> ${grade}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Highest Score:</strong> ${highestScore}%</p>
        <p><strong>Lowest Score:</strong> ${lowestScore}%</p>
    </div>
    `;

    //Display the students name safely as plain text
document.getElementById('resultsStudentName').textContent = studentName + "'s Results";
    
  //Close the grade form submit event 
});


  //Get the clear form button
    const clearFormButton = document.getElementById('clearButton');

    // clear the form and current result when the button is clicked
    clearFormButton.addEventListener('click', function() {
        
        // Clear all the input fields
        gradeForm.reset();

        //Clear the displayed results
        result.innerHTML = '';

        //Cancel editing mode
        editingStudent = null;

        // Restore the original button text
        gradeForm.querySelector('button[type="submit"]').textContent = 'Calculate Average';

    });


// Display a student in the results table
function displayStudent(student) {

    // Create a new row
    const newRow = studentTableBody.insertRow();

    // Add the student's information to the row
    newRow.innerHTML = `
        <td></td>
        <td>${student.assessment1}%</td>
        <td>${student.assessment2}%</td>
        <td>${student.assessment3}%</td>
        <td>${student.averageScore.toFixed(2)}%</td>
        <td>${student.grade}</td>   
        <td>
            <span class="${student.status === 'Pass' ? 'passStatus' : 'failStatus'}">
                ${student.status}
            </span>
        </td>
        <td>${student.highestScore}%</td>
        <td>${student.lowestScore}%</td>
        <td>
            <button class="deleteButton">Delete</button>
            <button class="editButton">Edit</button>
        </td>
    `;

    // Display the student's name safely as plain text
    newRow.cells[0].textContent = student.name;

    // Find the Edit button
    const editButton = newRow.querySelector('.editButton');

    // Load the students existing details into the form
    editButton.addEventListener('click', function() {

        // Remember the stuent being edited 
        editingStudent = student;

        // change the submit button text
        gradeForm.querySelector('button[type="submit"]').textContent = 'Update Student';


        document.getElementById('studentName').value = student.name;
        document.getElementById('assessment1').value = student.assessment1;
        document.getElementById('assessment2').value = student.assessment2;
        document.getElementById('assessment3').value = student.assessment3;

        // Move the screen back to the form
        gradeForm.scrollIntoView({ behavior: 'smooth' });

    });

   
// Find the Delete button
const deleteButton = newRow.querySelector('.deleteButton');

// Delete a student only after confirmation
deleteButton.addEventListener('click', function() {

    // Ask the user to confirm the deletion
    const confirmDelete = confirm(
        `Are you sure you want to delete ${student.name}'s record?`
    );

    // If Cancel is clicked, stop the deletion
    if (!confirmDelete) {
        return;
    }

    // Remove the student from the array
    students = students.filter(function(savedStudent) {
        return savedStudent !== student;
    });

    // Cancel editing if the deleted student was being edited
    if (editingStudent === student) {
        editingStudent = null;
        gradeForm.reset();
        result.innerHTML = '';
        gradeForm.querySelector('button[type="submit"]').textContent = 'Calculate Average';
    }

    // Save the updated student list
    localStorage.setItem('students', JSON.stringify(students));

    // Remove the student's row from the table
    newRow.remove();

    //Update the dashboard after deleting a student 
    updateDashboard();
});

// Close the displayStudent function
}


// Display all students previously saved in the browser
students.forEach(function(savedStudent) {
    displayStudent(savedStudent);
});

// Get the search input from the HTML
const searchStudent = document.getElementById('searchStudent');


function filterStudents() {

    // Get the student's name from the search box
    const searchText = searchStudent.value.toLowerCase().trim();

    // Get the selected Pass/Fail filter
    const selectedStatus = document.getElementById('filterStatus').value;

    // Get all student rows
    const rows = studentTableBody.querySelectorAll('tr');

    // Check each student row
    rows.forEach(function(row) {

        // Student name is in column 1
        const studentName = row.cells[0].textContent.toLowerCase();

        // Pass/Fail status is in column 7
        const studentStatus = row.cells[6].textContent.trim();

        // Check whether the student's name matches
        const matchesName = studentName.includes(searchText);

        // Check whether their Pass/Fail status matches
        const matchesStatus =
            selectedStatus === 'all' ||
            studentStatus === selectedStatus;

        // Show the student only if both conditions match
        if (matchesName && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Run the filter whenever someone types
searchStudent.addEventListener('input', filterStudents);


// Get the Pass/Fail dropdown
const filterStatus = document.getElementById('filterStatus');

// Run the filter whenever the dropdown changes
filterStatus.addEventListener('change', filterStudents);

    //  Student Sorting Feature ---

    // Get the sorting dropdown
    const sortStudents = document.getElementById('sortStudents');

    // Sort students based on the selected option
    function sortStudentResults() {

        // Get the selected sorting option
        const sortOption = sortStudents.value;

        // Copy the students array to preserve the saved order
        const sortedStudents = [...students];

        // Sort alphabetically from A to Z
        if (sortOption === 'nameAZ') {
            sortedStudents.sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });

        // Sort alphabetically from Z to A
        } else if (sortOption === 'nameZA') {
            sortedStudents.sort(function(a, b) {
                return b.name.localeCompare(a.name);
            });

        // Sort highest average first
        } else if (sortOption === 'highest') {
            sortedStudents.sort(function(a, b) {
                return b.averageScore - a.averageScore;
            });

        // Sort lowest average first
        } else if (sortOption === 'lowest') {
            sortedStudents.sort(function(a, b) {
                return a.averageScore - b.averageScore;
            });
        }

        // Clear the existing table
        studentTableBody.innerHTML = '';

        // Display the sorted students
        sortedStudents.forEach(function(student) {
            displayStudent(student);
        });

        // Keep the student search working
        filterStudents();
    }

    // Sort whenever the dropdown selection changes
    sortStudents.addEventListener('change', sortStudentResults);


// --- Student Performance Dashboard ---

// Calculate and display student performance statistics
function updateDashboard() {

    // Count the total number of students
    const totalStudents = students.length;

    // Start with zero for the total of all averages
    let totalAverage = 0;

    // Start with zero students passing and failing
    let passing = 0;
    let failing = 0;

    // Go through every saved student
    students.forEach(function(student) {

        // Add the student's average to the total
        totalAverage += student.averageScore;

        // Check whether the student passed or failed
        if (student.status === 'Pass') {
            passing++;
        } else {
            failing++;
        }
    });

    // Calculate the class average
    let classAverage = 0;

    // Avoid dividing by zero when there are no students
    if (totalStudents > 0) {
        classAverage = totalAverage / totalStudents;
    }

    // Display the statistics on the dashboard
    document.getElementById('totalStudents').textContent = totalStudents;

    document.getElementById('classAverage').textContent =
        classAverage.toFixed(2) + '%';

    document.getElementById('studentsPassing').textContent = passing;

    document.getElementById('studentsFailing').textContent = failing;

    // --- Update Student Performance Chart ---

    // Start with empty bar percentages
    let passPercentage = 0;
    let failPercentage = 0;

    // Calculate percentages when students exist
    if (totalStudents > 0) {
        passPercentage = (passing / totalStudents) * 100;
        failPercentage = (failing / totalStudents) * 100;
    }

    // Update the green passing bar
    document.getElementById('passBar').style.width =
        passPercentage + '%';

    // Update the red failing bar
    document.getElementById('failBar').style.width =
        failPercentage + '%';

    // Display the number of passing and failing students
    document.getElementById('passCount').textContent = passing;
    document.getElementById('failCount').textContent = failing;

}

// Display dashboard statistics when the page loads
updateDashboard();


 // --- Export Student Results to CSV ---

// Find the Export Results button
const exportButton = document.getElementById('exportButton');

// Run this code when the button is clicked
exportButton.addEventListener('click', function() {

    // Check whether there are any students to export
    if (students.length === 0) {
        alert('There are no student records to export.');
        return;
    }

    // Create the column headings for the CSV file
    const headers = [
        'Student Name',
        'Assessment 1',
        'Assessment 2',
        'Assessment 3',
        'Average',
        'Grade',
        'Status',
        'Highest',
        'Lowest'
    ];

    // Start the CSV with the column headings
    const csvRows = [headers];

    // Go through every saved student
    students.forEach(function(student) {

        // Put the student's information into a row
        csvRows.push([
            student.name,
            student.assessment1,
            student.assessment2,
            student.assessment3,
            student.averageScore.toFixed(2),
            student.grade,
            student.status,
            student.highestScore,
            student.lowestScore
        ]);
    });

    // Escape special characters so CSV columns stay correct
    const csvContent = csvRows.map(function(row) {
        return row.map(function(value) {
            const text = String(value).replace(/^[\s]*[=+\-@]/, "'$&");
            return '"' + text.replace(/"/g, '""') + '"';
        }).join(',');
    }).join('\r\n');

 // Create a downloadable CSV file
 // Tell Excel that commas separate the columns
const blob = new Blob(['\uFEFFsep=,\r\n' + csvContent], {
    type: 'text/csv;charset=utf-8;'
});

    // Create a temporary download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'student-results.csv';

    // Start the download
    document.body.appendChild(link);
    link.click();

    // Remove the temporary link
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});
