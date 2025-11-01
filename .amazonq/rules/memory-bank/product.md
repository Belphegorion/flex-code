# Product Overview

## Project Purpose
FlexCode (EventPro) is a comprehensive event management platform that connects event organizers with professional talent. The platform facilitates job posting, talent discovery, application management, secure payments through escrow, and real-time communication between organizers and professionals.

## Value Proposition
- **For Event Organizers**: Streamlined hiring process with ML-powered talent matching, secure payment handling, and integrated communication tools
- **For Professionals**: Discover relevant opportunities through intelligent matching algorithms, build reputation through reliability scores, and receive secure payments
- **Platform Benefits**: Automated reliability tracking, real-time notifications, background job processing, and comprehensive review system

## Key Features

### Talent Matching & Discovery
- ML-powered matching algorithm that scores jobs based on:
  - Skill compatibility (35% weight)
  - Geographic proximity (15% weight)
  - Professional ratings (15% weight)
  - Reliability scores (15% weight)
  - Availability windows (10% weight)
  - Past performance metrics (10% weight)
  - Recency bias for active opportunities
- Advanced search and filtering for organizers to find talent
- Profile-based discovery with skills, location, and availability

### Job Management
- Create and manage job postings with detailed requirements
- Specify skills, location, date/time, and compensation
- Track applications and hired professionals
- Check-in/check-out system for attendance tracking
- Job status workflow (open, in-progress, completed, cancelled)

### Application & Hiring System
- Professionals apply to jobs with cover letters
- Organizers review applications and hire talent
- Application status tracking (pending, accepted, rejected, completed)
- Automated notifications for status changes
- Bulk hiring capabilities for multiple positions

### Secure Payment Processing
- Escrow-based payment system using Stripe
- Payment held securely until job completion
- Automated payment release after confirmation
- Transaction history and tracking
- Refund handling for cancelled jobs

### Reliability & Reputation System
- Dynamic reliability scores (0.0 to 1.0 scale)
- Tracks completed jobs, no-shows, and cancellations
- Automated score updates via background jobs
- Impacts job matching and discovery rankings
- Review and rating system for both parties

### Real-Time Communication
- Socket.io-powered chat system
- Direct messaging between organizers and professionals
- Unread message tracking
- Message history and persistence
- Real-time notifications for new messages

### Background Job Processing
- Bull queue system with Redis backend
- Reliability score updates after job completion
- Automated reminders 24 hours before jobs
- Scheduled daily maintenance tasks
- Scalable job processing architecture

### User Management
- Role-based access control (organizer, professional, admin)
- JWT-based authentication with refresh tokens
- Profile management with skills and availability
- Video introduction uploads via Cloudinary
- Location-based services with coordinates

## Target Users

### Event Organizers
- Corporate event planners
- Wedding coordinators
- Conference organizers
- Festival producers
- Anyone needing temporary event staff

### Event Professionals
- Setup and breakdown crews
- Audio/visual technicians
- Catering staff
- Security personnel
- Specialized event talent (DJs, photographers, etc.)

### Administrators
- Platform moderators
- Dispute resolution handlers
- System maintenance personnel

## Use Cases

1. **Quick Staffing**: Organizer posts urgent job, professionals with matching skills receive notifications, apply instantly, and get hired within hours
2. **Talent Discovery**: Organizer searches for specific skills in a location, reviews profiles and ratings, contacts top candidates directly
3. **Reliable Hiring**: System recommends professionals with high reliability scores, reducing no-show risks
4. **Secure Payments**: Funds held in escrow until job completion, protecting both parties
5. **Reputation Building**: Professionals complete jobs successfully, receive positive reviews, improve reliability scores, and access better opportunities
6. **Multi-Job Events**: Organizer hires multiple professionals for different roles at a single event, manages all through one platform
