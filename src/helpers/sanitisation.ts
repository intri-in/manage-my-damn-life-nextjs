function sanitizeInput(input: string): string {
    // Remove HTML tags using a regular expression
    const sanitizedInput = input.replace(/(<([^>]+)>)/gi, '');
  
    // Escape special characters
    const escapedInput = escapeHtml(sanitizedInput);
  
    return escapedInput;
  }
  
  function escapeHtml(input: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };
  
    return input.replace(/[&<>"'/]/g, (match) => map[match]);
  }
  

