// server/src/utils/stringUtils.ts

// ✅ 1. Importe o Stemmer para Português
import { PorterStemmerPt } from 'natural';

const stopWords = new Set([
    'de', 'da', 'do', 'o', 'a', 'e', 'em', 'para', 'com', 'ao', 'aos', 'um', 'uma',
    'no', 'na', 'os', 'as', 'pelo', 'pela', 'seu', 'sua', 'que', 'como', 'sobre'
]);

export const normalizeTitle = (title: string): string => {
    if (!title) return '';
    
    // Remove acentos
    const semAcentos = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const palavras = semAcentos
        .toLowerCase()
        // Remove caracteres especiais, exceto letras, números e espaços
        .replace(/[^\w\s]/g, '') 
        // Divide a string em palavras
        .split(/\s+/)
        // Remove palavras vazias e stop words
        .filter(word => word && !stopWords.has(word))
        // ✅ 2. APLICA O STEMMING EM CADA PALAVRA
        .map(word => PorterStemmerPt.stem(word));

    // Ordena as palavras para garantir que a ordem não importe e junta de volta
    return palavras.sort().join(' ');
};