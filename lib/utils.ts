import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateStrongPassword () {
  // Generate a strong password with at least one uppercase, lowercase, number, and special character
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+=-"

  let newPassword = ""
  // Ensure at least one of each character type
  newPassword += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  newPassword += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  newPassword += numbers.charAt(Math.floor(Math.random() * numbers.length))
  newPassword += symbols.charAt(Math.floor(Math.random() * symbols.length))

  // Add more random characters to reach desired length (12 characters)
  const allChars = uppercase + lowercase + numbers + symbols
  for (let i = 0; i < 8; i++) {
    newPassword += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }

  // Shuffle the password
  newPassword = newPassword
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("")

    return newPassword;
  
}
