function countLineBreaks(str: string) {
 const regex = /\r\n|\r|\n/g;
 const matches = str.match(regex);

 return matches ? matches.length : 0;
}

export { countLineBreaks };
