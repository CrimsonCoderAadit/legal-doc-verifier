class LegalAnalysisService {
    constructor() {
        this.documentTypes = {
            'property_deed': {
                keywords: ['conveyance', 'sale deed', 'property', 'plot', 'land', 'immovable', 'registration', 'sub-registrar'],
                riskLevel: 'high'
            },
            'loan_agreement': {
                keywords: ['loan', 'borrower', 'lender', 'interest', 'emi', 'principal', 'default', 'collateral'],
                riskLevel: 'high'
            },
            'rental_agreement': {
                keywords: ['rent', 'tenant', 'landlord', 'lease', 'deposit', 'premises', 'occupation'],
                riskLevel: 'medium'
            },
            'employment_contract': {
                keywords: ['employee', 'employer', 'salary', 'designation', 'termination', 'probation'],
                riskLevel: 'medium'
            },
            'insurance_policy': {
                keywords: ['policy', 'premium', 'coverage', 'claim', 'beneficiary', 'insured'],
                riskLevel: 'medium'
            },
            'power_of_attorney': {
                keywords: ['power of attorney', 'attorney', 'authorize', 'behalf', 'execute'],
                riskLevel: 'high'
            }
        };

        this.dangerousClauses = [
            {
                type: 'penalty_clause',
                patterns: ['penalty', 'fine', 'liquidated damages', 'forfeiture'],
                explanation: 'This clause means you may have to pay additional money as punishment if you break the agreement',
                riskLevel: 'high'
            },
            {
                type: 'liability_clause',
                patterns: ['liable', 'responsible', 'damages', 'indemnify', 'hold harmless'],
                explanation: 'This clause makes you responsible for covering costs or damages that may occur',
                riskLevel: 'high'
            },
            {
                type: 'termination_clause',
                patterns: ['terminate', 'cancel', 'breach', 'default', 'violation'],
                explanation: 'This clause explains when and how the agreement can be ended',
                riskLevel: 'medium'
            },
            {
                type: 'payment_clause',
                patterns: ['payment', 'due', 'interest', 'late fee', 'overdue'],
                explanation: 'This clause specifies payment terms and what happens if you pay late',
                riskLevel: 'medium'
            },
            {
                type: 'ownership_transfer',
                patterns: ['transfer', 'convey', 'assign', 'ownership', 'title'],
                explanation: 'This clause transfers ownership rights from one party to another',
                riskLevel: 'high'
            }
        ];

        this.legalReferences = {
            'penalty_clause': 'Indian Contract Act, 1872 - Section 74',
            'liability_clause': 'Indian Contract Act, 1872 - Section 124',
            'payment_clause': 'Indian Contract Act, 1872 - Section 61',
            'ownership_transfer': 'Transfer of Property Act, 1882 - Section 54'
        };
    }

    analyzeDocument(text) {
        const analysis = {
            documentType: this.detectDocumentType(text),
            clauses: this.extractClauses(text),
            riskScore: 0,
            warnings: [],
            summary: ''
        };

        analysis.riskScore = this.calculateRiskScore(analysis.clauses);
        analysis.warnings = this.generateWarnings(analysis.clauses, analysis.documentType);
        analysis.summary = this.generateSummary(analysis);

        return analysis;
    }

    detectDocumentType(text) {
        const lowerText = text.toLowerCase();
        let bestMatch = { type: 'unknown', confidence: 0 };

        for (const [type, config] of Object.entries(this.documentTypes)) {
            let matches = 0;
            for (const keyword of config.keywords) {
                if (lowerText.includes(keyword.toLowerCase())) {
                    matches++;
                }
            }
            
            const confidence = matches / config.keywords.length;
            if (confidence > bestMatch.confidence) {
                bestMatch = { type, confidence, riskLevel: config.riskLevel };
            }
        }

        return bestMatch;
    }

    extractClauses(text) {
        const extractedClauses = [];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

        for (const clause of this.dangerousClauses) {
            for (let i = 0; i < sentences.length; i++) {
                const sentence = sentences[i].toLowerCase();
                
                const matchCount = clause.patterns.reduce((count, pattern) => {
                    return count + (sentence.includes(pattern.toLowerCase()) ? 1 : 0);
                }, 0);

                if (matchCount > 0) {
                    const context = this.getContext(sentences, i, 1);
                    extractedClauses.push({
                        id: `clause_${extractedClauses.length + 1}`,
                        type: clause.type,
                        text: context,
                        explanation: clause.explanation,
                        riskLevel: clause.riskLevel,
                        legalReference: this.legalReferences[clause.type] || 'General Contract Law',
                        matchStrength: matchCount / clause.patterns.length
                    });
                }
            }
        }

        return extractedClauses.sort((a, b) => b.matchStrength - a.matchStrength).slice(0, 5);
    }

    getContext(sentences, index, radius = 1) {
        const start = Math.max(0, index - radius);
        const end = Math.min(sentences.length, index + radius + 1);
        return sentences.slice(start, end).join('. ').trim();
    }

    calculateRiskScore(clauses) {
        let score = 0;
        for (const clause of clauses) {
            switch (clause.riskLevel) {
                case 'high': score += 3; break;
                case 'medium': score += 2; break;
                case 'low': score += 1; break;
            }
        }
        return Math.min(10, score);
    }

    generateWarnings(clauses, documentType) {
        const warnings = [];

        if (documentType.riskLevel === 'high') {
            warnings.push({
                type: 'document_risk',
                message: `This is a ${documentType.type.replace('_', ' ')} which requires careful review`,
                severity: 'high'
            });
        }

        const highRiskClauses = clauses.filter(c => c.riskLevel === 'high');
        if (highRiskClauses.length > 2) {
            warnings.push({
                type: 'multiple_risks',
                message: 'This document contains multiple high-risk clauses',
                severity: 'high'
            });
        }

        if (clauses.some(c => c.type === 'penalty_clause')) {
            warnings.push({
                type: 'penalty_warning',
                message: 'This document contains penalty clauses - you may face fines for violations',
                severity: 'medium'
            });
        }

        return warnings;
    }

    generateSummary(analysis) {
        const { documentType, clauses, riskScore } = analysis;
        
        let summary = `This appears to be a ${documentType.type.replace('_', ' ')}. `;
        
        if (clauses.length > 0) {
            summary += `Found ${clauses.length} important clauses including ${clauses.map(c => c.type.replace('_', ' ')).join(', ')}. `;
        }

        if (riskScore >= 7) {
            summary += 'HIGH RISK: This document requires legal consultation before signing.';
        } else if (riskScore >= 4) {
            summary += 'MEDIUM RISK: Review carefully and consider legal advice.';
        } else {
            summary += 'LOW RISK: Standard document with typical clauses.';
        }

        return summary;
    }
}

module.exports = new LegalAnalysisService();