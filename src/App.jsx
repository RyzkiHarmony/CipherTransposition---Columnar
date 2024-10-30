import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const App = () => {
    const [message, setMessage] = useState('');
    const [decryptMessage, setDecryptMessage] = useState('');
    const [key, setKey] = useState([1,2,3,4,5]);
    const [keyInput, setKeyInput] = useState('1,2,3,4,5');
    const [encryptedMessage, setEncryptedMessage] = useState('');
    const [decryptedMessage, setDecryptedMessage] = useState('');
    const [patternData, setPatternData] = useState([]);
    const [plaintextMatrix, setPlaintextMatrix] = useState([]);
    const [ciphertextMatrix, setCiphertextMatrix] = useState([]);
    const [charStats, setCharStats] = useState({});
    const [allPossibleDecryptions, setAllPossibleDecryptions] = useState([]);
    const [showMatrices, setShowMatrices] = useState(false);
    const [showStat, setShowStat] = useState(false);
    const [showColumnPattern, setShowColumnPattern] = useState(false);

    useEffect(() => {
        setCharStats(calculateCharStats(message.replace(/\s/g, '')));
    }, [message]);

    const getColumnOrder = (key) => {
        return key
            .map((value, index) => ({ value, index }))
            .sort((a, b) => a.value - b.value)
            .map(item => item.index);
    };

    const encrypt = () => {
        if (!message) return;
    
        const cleanMessage = message.replace(/\s/g, '');
        const numCols = key.length;
        const numRows = Math.ceil(cleanMessage.length / numCols);
    
        let plaintextGrid = Array.from({ length: numRows }, () => Array(numCols).fill(''));
        for (let i = 0; i < cleanMessage.length; i++) {
            const row = Math.floor(i / numCols);
            const col = i % numCols;
            plaintextGrid[row][col] = cleanMessage[i];
        }
    
        const columnOrder = getColumnOrder(key);
        let encrypted = '';
        let cipherGrid = Array.from({ length: numRows }, () => Array(numCols).fill(''));
    
        for (let i = 0; i < numCols; i++) {
            const currentCol = columnOrder[i];
            for (let row = 0; row < numRows; row++) {
                const char = plaintextGrid[row][currentCol];
                if (char) {
                    encrypted += char;
                    cipherGrid[row][i] = char;
                }
            }
        }
    
        setEncryptedMessage(encrypted);
        setPlaintextMatrix(plaintextGrid);
        setCiphertextMatrix(cipherGrid);
        setPatternData(plaintextGrid);
    };

    const decrypt = (customKey = key) => {
        if (!decryptMessage) return ''; // Changed from encryptedMessage to decryptMessage

        const numCols = customKey.length;
        const numRows = Math.ceil(decryptMessage.length / numCols); // Changed from encryptedMessage
        const columnOrder = getColumnOrder(customKey);

        let decryptGrid = Array.from({ length: numRows }, () => Array(numCols).fill(''));
        const fullRows = Math.floor(decryptMessage.length / numCols); // Changed from encryptedMessage
        const remainingChars = decryptMessage.length % numCols; // Changed from encryptedMessage

        let pos = 0;
        for (let i = 0; i < numCols; i++) {
            const colLength = fullRows + (columnOrder[i] < remainingChars ? 1 : 0);
            const targetCol = columnOrder[i];

            for (let row = 0; row < colLength; row++) {
                if (pos < decryptMessage.length) { // Changed from encryptedMessage
                    decryptGrid[row][targetCol] = decryptMessage[pos++]; // Changed from encryptedMessage
                }
            }
        }

        let decrypted = '';
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                if (decryptGrid[row][col]) {
                    decrypted += decryptGrid[row][col];
                }
            }
        }

        return decrypted;
    };

    const calculateCharStats = (text) => {
        if (!text) return {};

        const stats = {};
        const total = text.length;

        [...text].forEach(char => {
            stats[char] = (stats[char] || 0) + 1;
        });

        const percentages = {};
        Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([char, count]) => {
                percentages[char] = (count / total * 100).toFixed(1);
            });

        return percentages;
    };

    const generatePermutations = (arr) => {
        if (arr.length <= 1) return [arr];
        const result = [];

        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
            const permutations = generatePermutations(remaining);

            for (let perm of permutations) {
                result.push([current, ...perm]);
            }
        }

        return result;
    };

    const randomizeKey = () => {
        let numbers = [1, 2, 3, 4, 5];
        let randomized = [];
        while (numbers.length > 0) {
            const randomIndex = Math.floor(Math.random() * numbers.length);
            randomized.push(numbers[randomIndex]);
            numbers.splice(randomIndex, 1);
        }
        setKey(randomized);
        setCiphertextMatrix([]);
    };

    const handleKeyChange = (e) => {
        const input = e.target.value;
        setKeyInput(input);
        
        // Convert input string to array of numbers
        const newKey = input.split(',')
            .map(num => parseInt(num.trim()))
            .filter(num => !isNaN(num));

        // Only update key if we have valid numbers
        if (newKey.length > 0) {
            setKey(newKey);
        }
    };

    const handleDecrypt = () => {
        const result = decrypt();
        setDecryptedMessage(result);
    };

    const analyzeAllPatterns = () => {
        const results = [];
        
        // Generate combinations for different key lengths (2 to 5)
        for(let length = 2; length <= 5; length++) {
            const baseKey = Array.from({ length: length }, (_, i) => i + 1);
            const permutations = generatePermutations(baseKey);
            
            // For each permutation, try decryption
            permutations.forEach(permutation => {
                const decrypted = decrypt(permutation);
                results.push({
                    key: permutation,
                    keyLength: permutation.length,
                    decrypted: decrypted
                });
            });
        }
    
        // Sort results by decrypted message length and key length
        const sortedResults = results.sort((a, b) => {
            if (b.decrypted.length === a.decrypted.length) {
                return a.keyLength - b.keyLength; // Prefer shorter keys when decrypted lengths are equal
            }
            return b.decrypted.length - a.decrypted.length;
        });
    
        setAllPossibleDecryptions(sortedResults);
    };

    const displayMatrixWithColumnNumbers = (matrix, isCipher) => {
        const columnOrder = getColumnOrder(isCipher ? key : key);
        return (
            <div>
                <div style={{ display: 'flex', fontWeight: 'bold', marginBottom: '5px' }}>
                    {Array.from({ length: key.length }, (_, i) => (
                        <div key={i} style={{ width: '47px', textAlign: 'center' }}>
                            {isCipher ? columnOrder[i] + 1 : i + 1}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const plotData = {
        labels: Array.from({ length: key.length }, (_, i) => `Kolom ${key[i]}`),
        datasets: patternData.map((row, index) => ({
            label: `Baris ${index + 1}`,
            data: row.map((char) => (char ? 1 : 0)),
            backgroundColor: row.map((char) => (char ? 'rgba(75, 192, 192, 0.6)' : 'rgba(192, 75, 75, 0.3)')),
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        })),
    };

    const charStatsData = {
        labels: Object.keys(charStats),
        datasets: [{
            data: Object.values(charStats),
            backgroundColor: Object.keys(charStats).map((_, index) =>
                `hsl(${(index * 360) / Object.keys(charStats).length}, 70%, 60%)`
            ),
            borderWidth: 1,
        }],
    };

    const charStatsOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 20,
                    padding: 5,
                    font: { size: 14 },
                    generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels.map((label, index) => ({
                            text: `${label} (${data.datasets[0].data[index]}%)`,
                            fillStyle: data.datasets[0].backgroundColor[index],
                            fontColor: '#F0F0F0',
                            index
                        }));
                    }
                },
            },
            title: {
                display: true,
                text: 'Distribusi Karakter (%)',
                style: {
                    fontSize: 45,
                    marginBottom: 100,
                    color: '#F0F0F0'
                }
            },
        },
    };

    return (
        <div className="container">
            <h1 className="header">Enkripsi Transposisi Columnar</h1>
            
            <textarea
                className="textarea"
                rows="4"
                placeholder="Masukkan Plaintext untuk Enkripsi"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <textarea
                className="textarea"
                rows="4"
                placeholder="Masukkan Text untuk Dekripsi"
                value={decryptMessage}
                onChange={(e) => setDecryptMessage(e.target.value)}
            />
            
            <div className="key-input-container">
                <input
                    type="text"
                    className="key-input"
                    placeholder="Masukkan key (pisahkan dengan koma)"
                    value={keyInput}
                    onChange={handleKeyChange}
                />
            </div>

            <div className="result-box1">
                Key: <br />
                {key.join(' - ')}
            </div>

            <div className="button-group">
                <button className="button" onClick={encrypt}>Enkripsi</button>
                <button className="button" onClick={handleDecrypt}>Dekripsi</button>
                <button className="button" onClick={randomizeKey}>Randomize Key</button>
                <button className="button" onClick={analyzeAllPatterns}>Analisis Semua Pola</button>
            </div>

            <div>
                <h3>Hasil Enkripsi:</h3>
                <div className="result-box">{encryptedMessage || '-'}</div>
            </div>

            <div>
                <h3>Hasil Dekripsi:</h3>
                <div className="result-box">{decryptedMessage || '-'}</div>
            </div>

            {allPossibleDecryptions.length > 0 && (
                <div>
                    <h3>Hasil Analisis Semua Pola:</h3>
                    <div className="analysis-table-container">
                        <table className="analysis-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Panjang Key</th>
                                    <th>Kunci</th>
                                    <th>Hasil Dekripsi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allPossibleDecryptions.map((result, index) => (
                                    <tr key={index} className={index === 0 ? 'selected-row' : ''}>
                                        <td>{index + 1}</td>
                                        <td>{result.keyLength}</td>
                                        <td>{result.key.join(' - ')}</td>
                                        <td>{result.decrypted}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}  

            <div className="dropdown-section">
                <button className="dropdown-button" onClick={() => setShowStat(!showStat)}>
                    {showStat ? '▼' : '▶'} Statistik Karakter
                </button>
                {showStat && (
                    <div className="stat-wrapper">
                        <div className="chart-container">
                            <h3>Statistik Karakter</h3>
                            {Object.keys(charStats).length > 0 && (
                                <div className="pie-chart">
                                    <Pie data={charStatsData} options={charStatsOptions} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="dropdown-section">
                <button className="dropdown-button" onClick={() => setShowMatrices(!showMatrices)}>
                    {showMatrices ? '▼' : '▶'} Matriks Kolom
                </button>
                {showMatrices && (
                    <div className="matrices-wrapper">
                        <div className="matrix-container">
                            <h3>Matriks Plaintext</h3>
                            {displayMatrixWithColumnNumbers(plaintextMatrix, false)}
                            <div className="matrix-grid">
                                {plaintextMatrix.map((row, rowIndex) => (
                                    <div key={rowIndex} className="matrix-row">
                                        {row.map((cell, colIndex) => (
                                            <div 
                                                key={colIndex} 
                                                className="matrix-cell"
                                                style={{ backgroundColor: cell ? '#e6f3ff' : '#ffffff' }}
                                            >
                                                {cell || '-'}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="matrix-container">
                            <h3>Matriks Ciphertext</h3>
                            {displayMatrixWithColumnNumbers(ciphertextMatrix, true)}
                            <div className="matrix-grid">
                                {ciphertextMatrix.map((row, rowIndex) => (
                                    <div key={rowIndex} className="matrix-row">
                                        {row.map((cell, colIndex) => (
                                            <div 
                                                key={colIndex} 
                                                className="matrix-cell"
                                                style={{ backgroundColor: cell ? '#e6f3ff' : '#ffffff' }}
                                            >
                                                {cell || '-'}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="dropdown-section">
                <button className="dropdown-button" onClick={() => setShowColumnPattern(!showColumnPattern)}>
                    {showColumnPattern ? '▼' : '▶'} Pola Transposisi Kolom
                </button>
                {showColumnPattern && (
                    <div className="chart-container">
                        <Bar 
                            data={plotData} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: true, 
                                scales: {
                                    x: {
                                        ticks: { color: '#ffffff' },
                                        grid: { color: '#ffffff' }
                                    },
                                    y: {
                                        ticks: { color: '#ffffff' },
                                        grid: { color: '#ffffff0' }
                                    }
                                },
                                plugins: {
                                    legend: {
                                        labels: { color: '#ffffff' }
                                    }
                                } 
                            }} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;