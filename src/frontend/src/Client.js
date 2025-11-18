import fetch from 'unfetch';
/**
 * Checks if the HTTP response status is OK (2xx).
 * 
 * @param {Response} response - The fetch API Response object to check
 * @returns {Response|Promise<never>} Returns the response if status is OK, otherwise returns a rejected Promise with an Error
 * @throws {Error} Throws an error with the response statusText if the response is not OK. The error object includes the original response in its `response` property
 */
const checkStatus = response => {
    if (response.ok) {
        console.log('API response OK',response);
        return response;
    }
    // convert non-2xx HTTP responses into errors:
    const error = new Error(response.statusText);
    error.response = response;
    return Promise.reject(error);
}
/**
 * Fetches all students from the API.
 * 
 * @async
 * @function getAllStudents
 * @returns {Promise<Array>} A promise that resolves to an array of student objects
 * @throws {Error} If the response status is not ok
 * @description Makes a GET request to the students endpoint. 
 * Note: CORS is handled via proxy configuration in package.json
 */
export const getAllStudents = () =>
    fetch("/api/v1/students")
        .then(response => checkStatus(response));
/**
 * Fetches a paginated list of students from the API.
 * 
 * @param {number} [page=0] - The page number to retrieve (zero-indexed)
 * @param {number} [size=50] - The number of students per page
 * @param {string} [sortBy='id'] - The field to sort by
 * @param {string} [direction='asc'] - The sort direction ('asc' or 'desc')
 * @returns {Promise} A promise that resolves with the paginated student data after status check
 */
export const getStudentsPage = (page = 0, size = 50, sortBy = 'id', direction = 'asc') =>
    fetch(`/api/v1/students/page?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`)
        .then(response => checkStatus(response));
/**
 * Fetches a paginated student search with optional filters.
 * @param {number} page 0-based page index
 * @param {number} size page size
 * @param {string} sortBy sort field
 * @param {('asc'|'desc')} direction sort direction
 * @param {('MALE'|'FEMALE'|'OTHER'|undefined)} gender optional gender filter (enum)
 * @param {string|undefined} domain optional email domain filter (e.g., 'gmail.com')
 */
export const getStudentsSearch = (page = 0, size = 50, sortBy = 'id', direction = 'asc', gender, domain) => {
    const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, direction });
    if (gender) {
        const g = String(gender).trim().toUpperCase();
        const allowed = new Set(['MALE', 'FEMALE', 'OTHER']);
        if (allowed.has(g)) params.set('gender', g);
    }
    if (domain) params.set('domain', domain);
    return fetch(`/api/v1/students/search?${params.toString()}`)
        .then(response => checkStatus(response));
}
/**
 * Adds a new student to the system by sending a POST request to the API endpoint.
 * 
 * @param {Object} student - The student object to be added
 * @param {string} student.name - The name of the student
 * @param {string} student.email - The email of the student
 * @param {string} student.gender - The gender of the student
 * @returns {Promise} A promise that resolves with the response after status check
 * @throws {Error} Throws an error if the request fails or status check fails
 */
export const addNewStudent = student =>
    fetch("/api/v1/students", {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(student)
    }).then(checkStatus);
/**
 * Deletes a student by their ID from the backend API.
 * 
 * @param {string|number} studentId - The unique identifier of the student to delete
 * @returns {Promise} A promise that resolves with the response after checking the status
 * @throws {Error} Throws an error if the fetch request fails or status check fails
 */
export const deleteStudent = studentId =>
    fetch(`/api/v1/students/${studentId}`, {
        method: 'DELETE'
    }).then(checkStatus);
/**
 * Updates an existing student's information on the server.
 * 
 * @param {string|number} studentId - The unique identifier of the student to update
 * @param {Object} student - The student object containing updated information
 * @returns {Promise} A promise that resolves with the response after status check
 * @throws {Error} Throws an error if the fetch request fails or status check fails
 */
export const updateStudent = (studentId, student) =>
    fetch(`/api/v1/students/${studentId}`, {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify(student)
    }).then(checkStatus);

// Global gender stats
export const getGenderStats = () =>
    fetch('/api/v1/students/stats/gender').then(checkStatus);

export const getDomainStats = () =>
    fetch('/api/v1/students/stats/domains').then(checkStatus);