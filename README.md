Auction System Project
Description

This project is a full-stack online auction platform built using a microservices architecture. The system allows users to participate in auctions by placing bids in real time, while admin can manage and create auctions through a dedicated admin dashboard.

Overview

The application is developed using TypeScript with Node.js backend services and a Next.js frontend. Users can browse active auctions and place bids on items, while the system processes each bid and updates the highest bid in real time. Administrators are responsible for creating auctions, uploading item images, and managing the platform.

Key Features

The platform includes user authentication and session management using JWT tokens to securely handle user sessions. Administrators can create and manage auctions through an admin dashboard, including uploading images for auction items using Cloudinary. The system supports real-time bidding and ensures fair participation by applying rate limiting to prevent excessive or malicious bidding activity. Users receive live updates about auction activity through Socket.io, and email notifications are sent for important auction events.

Architecture

The system follows a microservices architecture where different services handle specific responsibilities such as user management, auction management, bidding operations, and administrative controls. RabbitMQ is used as a message queue to handle asynchronous tasks such as processing bids and sending email notifications. A bidding processor service validates incoming bids and broadcasts updates to connected users, while a mail service consumes messages from the queue to send notification emails. Rate limiting is applied per user and per IP address to reduce spam and protect the platform from misuse.

Tech Stack

The backend is built using Node.js and TypeScript with Express. The frontend is developed using Next.js and React with TypeScript. MongoDB is used as the primary database for storing users, auctions, and bid data. RabbitMQ is used for message queue management, Cloudinary is used for storing auction images, and Socket.io enables real-time communication between the server and connected users.

Use Cases

Users can register and log in to the platform to participate in live auctions. Administrators create and manage auctions through the admin dashboard, while users browse available auctions and place bids. The system keeps track of bid history and automatically updates the highest bid in real time. Email notifications keep users informed about important auction events such as new bids or auction completion, and rate limiting ensures that bidding remains fair and controlled.
