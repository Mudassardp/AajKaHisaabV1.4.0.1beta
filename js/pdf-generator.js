
// PDF Generator for HisaabKitaab
(function() {
    'use strict';

    const PDF_APP_VERSION = "1.7";

    function generateExpensePDF(sheetData, participants, isAdmin) {
        // Show loading overlay
        if (window.showPDFLoading) {
            window.showPDFLoading();
        }
        
        try {
            // Check sheet version
            const sheetVersion = sheetData.version || "1.6";
            const isNewVersion = parseFloat(sheetVersion) >= 1.7;
            
            // Helper function to get participant banks
            const getParticipantBanks = (name) => {
                if (!window.profileManager) return [];
                const profile = window.profileManager.getProfile(name);
                if (!profile || !profile.bank) return [];
                return profile.bank.split(',').map(b => b.trim()).filter(b => b.length > 0);
            };
            
            // Get bank info for each settlement (only for new version sheets)
            const settlementsWithBankInfo = [];
            if (sheetData.settlements) {
                Object.values(sheetData.settlements).forEach(settlement => {
                    let sameBank = false;
                    let commonBanks = [];
                    
                    if (isNewVersion) {
                        const debtorBanks = getParticipantBanks(settlement.from);
                        const creditorBanks = getParticipantBanks(settlement.to);
                        
                        // Check if they share any bank
                        sameBank = debtorBanks.some(bank => creditorBanks.includes(bank));
                        if (sameBank) {
                            commonBanks = debtorBanks.filter(bank => creditorBanks.includes(bank));
                        }
                    }
                    
                    settlementsWithBankInfo.push({
                        ...settlement,
                        sameBank: sameBank,
                        commonBanks: commonBanks
                    });
                });
            }
            
            // Create PDF content
            const pdfContent = createPDFContent(sheetData, participants, isAdmin, isNewVersion, settlementsWithBankInfo);
            
            // Generate PDF options
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `${sheetData.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    scrollX: 0,
                    scrollY: 0
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };
            
            // Generate and download PDF
            html2pdf().set(opt).from(pdfContent).toPdf().get('pdf').then(function(pdf) {
                // Add page numbers
                const totalPages = pdf.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(8);
                    pdf.setTextColor(150);
                    pdf.text(`Page ${i} of ${totalPages}`, pdf.internal.pageSize.getWidth() - 20, pdf.internal.pageSize.getHeight() - 10);
                }
            }).save().then(() => {
                console.log('PDF generated successfully');
            }).catch(error => {
                console.error('PDF generation error:', error);
                alert('Error generating PDF: ' + error.message);
            }).finally(() => {
                // Hide loading
                if (window.hidePDFLoading) {
                    window.hidePDFLoading();
                }
                // Clean up
                if (pdfContent.parentNode) {
                    pdfContent.remove();
                }
            });
            
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF: ' + error.message);
            if (window.hidePDFLoading) {
                window.hidePDFLoading();
            }
        }
    }
    
    function createPDFContent(sheetData, participants, isAdmin, isNewVersion, settlementsWithBankInfo) {
        // Create container
        const pdfContainer = document.createElement('div');
        pdfContainer.style.cssText = `
            padding: 20px;
            font-family: 'Arial', 'Helvetica', sans-serif;
            color: #333;
            line-height: 1.4;
            max-width: 800px;
            margin: 0 auto;
            background: white;
        `;
        
        // Calculate totals if not already calculated
        let totalSpent = sheetData.totalSpent || 0;
        let totalMeals = sheetData.totalMeals || 0;
        let costPerMeal = sheetData.costPerMeal || 0;
        
        if (!sheetData.totalSpent) {
            participants.forEach(participant => {
                totalSpent += sheetData.expenses[participant].spent || 0;
                totalMeals += sheetData.expenses[participant].meals || 0;
            });
            costPerMeal = totalMeals > 0 ? totalSpent / totalMeals : 0;
        }
        
        // Format date for display
        function formatDateTime(date) {
            if (!date) return 'Unknown';
            const d = new Date(date);
            return d.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
        
        const displayDate = sheetData.lastUpdated ? 
                          formatDateTime(sheetData.lastUpdated) : 
                          sheetData.date ? 
                          formatDateTime(sheetData.date) : 
                          formatDateTime(sheetData.createdAt);
        
        // Header Section
        const header = `
            <div style="text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 15px; margin-bottom: 20px; page-break-after: avoid;">
                <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 5px; font-weight: bold;">HisaabKitaabApp</h1>
                <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 15px;">Weekly Expense Split</p>
                <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f8f9fa; padding: 10px 15px; border-radius: 5px; border-left: 4px solid #3498db;">
                    <div>
                        <strong style="color: #2c3e50; font-size: 16px;">${sheetData.name || 'Unnamed Sheet'}</strong>
                        <div style="color: #7f8c8d; font-size: 12px; margin-top: 5px;">Sheet Version: ${sheetData.version || '1.6'}</div>
                    </div>
                    <span style="color: #7f8c8d; font-size: 12px;">Updated: ${displayDate}</span>
                </div>
            </div>
        `;
        
        // Summary Section
        let summarySection = `
            <div style="margin-bottom: 20px; page-break-after: avoid;">
                <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #eaeaea; padding-bottom: 5px; font-weight: bold;">Expense Summary</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <tr>
                        <td style="padding: 6px 8px; border-bottom: 1px solid #eaeaea; font-weight: 600; color: #2c3e50; width: 60%;">Total Participants:</td>
                        <td style="padding: 6px 8px; border-bottom: 1px solid #eaeaea; text-align: right; font-weight: bold; color: #2c3e50;">${participants.length}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 8px; border-bottom: 1px solid #eaeaea; font-weight: 600; color: #2c3e50;">Total Spent:</td>
                        <td style="padding: 6px 8px; border-bottom: 1px solid #eaeaea; text-align: right; font-weight: bold; color: #2c3e50;">${totalSpent.toFixed(2)} SAR</td>
                    </tr>
        `;
        
        if (isAdmin) {
            summarySection += `
                    <tr>
                        <td style="padding: 6px 8px; border-bottom: 1px solid #eaeaea; font-weight: 600; color: #2c3e50;">Total Meals:</td>
                        <td style="padding: 6px 8px; border-bottom: 1px solid #eaeaea; text-align: right; font-weight: bold; color: #2c3e50;">${totalMeals}</td>
                    </tr>
            `;
        }
        
        summarySection += `
                    <tr>
                        <td style="padding: 6px 8px; border-bottom: 1px solid #eaeaea; font-weight: 600; color: #2c3e50;">Cost Per Meal:</td>
                        <td style="padding: 6px 8px; border-bottom: 1px solid #eaeaea; text-align: right; font-weight: bold; color: #2c3e50;">${costPerMeal.toFixed(2)} SAR</td>
                    </tr>
                </table>
            </div>
        `;
        
        // Individual Shares Section
        let sharesSection = `
            <div style="margin-bottom: 20px; page-break-after: avoid;">
                <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #eaeaea; padding-bottom: 5px; font-weight: bold;">Individual Shares</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #e0e0e0; page-break-inside: avoid;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 8px 10px; text-align: left; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db;">Participant</th>
                            <th style="padding: 8px 10px; text-align: right; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db;">Spent (SAR)</th>
                            <th style="padding: 8px 10px; text-align: center; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db;">Meals</th>
                            <th style="padding: 8px 10px; text-align: right; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db;">To Be Paid (SAR)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        participants.forEach(participant => {
            const expense = sheetData.expenses[participant] || { spent: 0, meals: 3, toBePaid: 0 };
            const mealsDisplay = expense.meals === 3 ? 'All Meals' : `${expense.meals} Meal${expense.meals > 1 ? 's' : ''}`;
            const toBePaidColor = expense.toBePaid > 0 ? '#e74c3c' : expense.toBePaid < 0 ? '#27ae60' : '#2c3e50';
            const toBePaidSign = expense.toBePaid > 0 ? '+' : '';
            
            sharesSection += `
                        <tr>
                            <td style="padding: 6px 8px; border-bottom: 1px solid #e0e0e0;">${participant}</td>
                            <td style="padding: 6px 8px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 600;">${expense.spent.toFixed(2)}</td>
                            <td style="padding: 6px 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${mealsDisplay}</td>
                            <td style="padding: 6px 8px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 600; color: ${toBePaidColor};">${toBePaidSign}${expense.toBePaid.toFixed(2)}</td>
                        </tr>
            `;
        });
        
        // Total row
        sharesSection += `
                        <tr style="background-color: #e8f4fc; font-weight: bold;">
                            <td style="padding: 8px 10px; border-top: 2px solid #3498db;">Total</td>
                            <td style="padding: 8px 10px; border-top: 2px solid #3498db; text-align: right;">${totalSpent.toFixed(2)}</td>
                            <td style="padding: 8px 10px; border-top: 2px solid #3498db; text-align: center;">${totalMeals}</td>
                            <td style="padding: 8px 10px; border-top: 2px solid #3498db; text-align: right;">0.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        // Settlements Section - FORCE TO NEW PAGE
        let settlementsSection = `
            <div style="margin-bottom: 20px; page-break-before: always; padding-top: 20px;">
                <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #eaeaea; padding-bottom: 5px; font-weight: bold;">Settlement Instructions</h2>
        `;
        
        const settlements = settlementsWithBankInfo.length > 0 ? settlementsWithBankInfo : 
                          (sheetData.settlements ? Object.values(sheetData.settlements) : []);
        
        if (settlements.length === 0) {
            settlementsSection += `
                <div style="text-align: center; color: #7f8c8d; font-style: italic; padding: 20px; background-color: #f8f9fa; border-radius: 5px; border: 1px dashed #ddd;">
                    All balances are settled! 🎉
                </div>
            `;
        } else {
            // Add note about settlement algorithm
            if (isNewVersion) {
                settlementsSection += `
                    <div style="background-color: #e8f6f3; color: #155724; padding: 8px 12px; border-radius: 5px; border-left: 4px solid #27ae60; margin-bottom: 15px; font-size: 12px;">
                        <strong>Note:</strong> This sheet uses bank-aware settlement algorithm (v${sheetData.version || '1.7'}). 
                        Same-bank transfers are prioritized for easier transactions.
                    </div>
                `;
            }
            
            settlements.forEach(settlement => {
                const statusColor = settlement.status === 'paid' ? '#27ae60' : '#e74c3c';
                const statusBg = settlement.status === 'paid' ? '#e8f6f3' : '#fdedec';
                const statusText = settlement.status === 'paid' ? 'Paid' : 'Not Paid';
                
                // Add bank indicator for new version sheets
                let bankIndicator = '';
                if (isNewVersion && settlement.sameBank && settlement.commonBanks && settlement.commonBanks.length > 0) {
                    const bankNames = settlement.commonBanks.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(', ');
                    bankIndicator = `<span style="font-size: 10px; color: #27ae60; background-color: #e8f6f3; padding: 2px 6px; border-radius: 3px; margin-left: 8px; border: 1px solid #27ae60;">🏦 ${bankNames}</span>`;
                }
                
                settlementsSection += `
                    <div style="background-color: #f8f9fa; padding: 10px 12px; margin-bottom: 6px; border-radius: 5px; border-left: 3px solid #9b59b6; page-break-inside: avoid;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 6px; font-weight: 600;">
                                <span>${settlement.from}</span>
                                <span style="color: #7f8c8d;">→</span>
                                <span>${settlement.to}</span>
                                ${bankIndicator}
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-weight: bold; color: #2c3e50; background-color: #e8f4fc; padding: 4px 8px; border-radius: 3px; border: 1px solid #3498db; font-size: 12px;">
                                    ${settlement.amount} SAR
                                </span>
                                <span style="font-weight: 600; padding: 4px 8px; border-radius: 3px; font-size: 11px; color: ${statusColor}; background-color: ${statusBg}; border: 1px solid ${statusColor};">
                                    ${statusText}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        settlementsSection += `</div>`;
        
        // Footer
        const footer = `
            <div style="text-align: center; margin-top: 25px; padding-top: 12px; border-top: 1px solid #eaeaea; color: #7f8c8d; font-size: 8px;">
                <p>Generated with HisaabKitaabApp (created by Mudassar) • ${new Date().toLocaleString()} • Beta-v${PDF_APP_VERSION}</p>
            </div>
        `;
        
        // Combine all sections
        pdfContainer.innerHTML = header + summarySection + sharesSection + settlementsSection + footer;
        
        // Add to document for rendering
        document.body.appendChild(pdfContainer);
        
        return pdfContainer;
    }
    
    // Main PDF generation function
    window.generateExpensePDF = generateExpensePDF;
})();
