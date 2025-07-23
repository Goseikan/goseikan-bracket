# Kendo Tournament App - BDD Scenarios

## Feature: User Registration and Authentication

### Scenario: New user registers with existing dojo
```gherkin
Feature: User Registration
  As a kendo practitioner
  I want to register for the tournament
  So that I can participate in matches

  Scenario: Register with existing dojo
    Given I am on the registration page
    When I enter my full name "John Doe"
    And I enter my email "john@example.com"
    And I enter my date of birth "1990-01-01"
    And I select "3 Dan" from the kendo rank dropdown
    And I start typing "Tokyo" in the dojo field
    Then I should see "Tokyo Kendo Club" in the dropdown
    When I select "Tokyo Kendo Club"
    And I start typing "Team A" in the team field
    Then I should see "Team A" in the dropdown
    When I select "Team A"
    And I enter a password
    And I click "Register"
    Then I should be redirected to the dashboard
    And I should see "Welcome, John Doe"
    And I should see "3 Dan" as my rank
```

### Scenario: New user creates new dojo and team
```gherkin
  Scenario: Create new dojo and team
    Given I am on the registration page
    When I enter my full name "Jane Smith"
    And I enter my email "jane@example.com"
    And I enter my date of birth "1995-05-15"
    And I select "1 Kyu" from the kendo rank dropdown
    And I type "New Dojo" in the dojo field
    Then I should see "Create new dojo: New Dojo"
    When I select "Create new dojo: New Dojo"
    And I type "Team Alpha" in the team field
    Then I should see "Create new team: Team Alpha"
    When I select "Create new team: Team Alpha"
    And I enter a password
    And I click "Register"
    Then I should be redirected to the dashboard
    And I should see "Welcome, Jane Smith"
    And I should see "New Dojo" as my dojo
    And I should see "Team Alpha" as my team
    And I should see "1 Kyu" as my rank
```

## Feature: User Dashboard

### Scenario: View personal information and dojo members
```gherkin
Feature: User Dashboard
  As a registered tournament participant
  I want to view my information and dojo details
  So that I can see my tournament status

  Scenario: View dashboard information
    Given I am logged in as "John Doe" with rank "3 Dan"
    When I navigate to the dashboard
    Then I should see my name "John Doe"
    And I should see my dojo "Tokyo Kendo Club"
    And I should see my team "Team A"
    And I should see my rank "3 Dan" displayed with proper styling
    And I should see a list of dojo members with their ranks sorted by highest rank first
    And I should see teams within the dojo sorted by average rank
    And I should see my current tournament ranking
    And I should see my assigned court if available
```

## Feature: Tournament Bracket Visualization

### Scenario: View tournament bracket progression
```gherkin
Feature: Tournament Bracket
  As a tournament participant
  I want to view the tournament bracket
  So that I can track my progress and upcoming matches

  Scenario: View seed stage bracket
    Given the tournament is in "seed" stage
    When I navigate to the bracket page
    Then I should see seed groups
    And I should see round-robin matches within each group
    And I should see team standings for each group
    And I should see my team's position in the group
    And I should see upcoming matches
```

### Scenario: View main stage bracket
```gherkin
  Scenario: View double elimination bracket
    Given the tournament is in "main" stage
    When I navigate to the bracket page
    Then I should see the winners bracket
    And I should see the losers bracket
    And I should see completed matches with winners
    And I should see upcoming matches
    And I should see overall tournament rankings
```

## Feature: Admin Tournament Management

### Scenario: Admin creates new tournament
```gherkin
Feature: Admin Tournament Management
  As a tournament administrator
  I want to manage tournament settings
  So that I can organize the competition effectively

  Scenario: Create new tournament
    Given I am logged in as an admin
    When I navigate to the admin dashboard
    And I click "Create New Tournament"
    And I enter tournament name "Spring Championship 2024"
    And I set maximum participants to "100"
    And I set number of courts to "4"
    And I click "Create Tournament"
    Then I should see "Tournament created successfully"
    And the tournament status should be "registration"
```

### Scenario: Admin progresses tournament stages
```gherkin
  Scenario: Progress from registration to seed stage
    Given I am logged in as an admin
    And there is an active tournament in "registration" stage
    And there are at least 8 registered teams
    When I navigate to the admin dashboard
    And I click "Generate Seed Groups"
    Then I should see seed groups created
    And teams should be distributed avoiding same-dojo conflicts
    And the tournament status should change to "seed"
```

## Feature: Court Management

### Scenario: Admin manages court matches
```gherkin
Feature: Court Management
  As a tournament administrator
  I want to manage matches on each court
  So that I can track real-time scoring

  Scenario: Start a match on court
    Given I am logged in as an admin
    And there is a scheduled match between "Team A" and "Team B"
    When I navigate to court management
    And I select "Court 1"
    And I assign the match to "Court 1"
    And I click "Start Match"
    Then the match status should change to "in_progress"
    And I should see player 1 vs player 1 setup
    And I should see scoring buttons (men, kote, tsuki, do, hansoku)
```

### Scenario: Score tracking during match
```gherkin
  Scenario: Track kendo scoring actions
    Given I am managing a match in progress
    And "Team A Player 1 (2 Dan)" is facing "Team B Player 1 (1 Dan)"
    When I click "Men" for "Team A Player 1"
    Then I should see the men point recorded
    And the score should update
    When "Team A Player 1" gets 2 points first
    Then "Team A Player 1 (2 Dan)" should win the set
    And I should see "Next Set" button
    When I click "Next Set"
    Then I should see "Team A Player 2 (1 Kyu)" vs "Team B Player 2 (3 Kyu)"
    And I should see both players' ranks displayed
```

## Feature: Public Court Display

### Scenario: Public view shows current match info
```gherkin
Feature: Public Court Display
  As a tournament spectator
  I want to view court information on a public display
  So that I can follow the matches

  Scenario: View public court display
    Given there is a match in progress on "Court 1"
    When I navigate to the public display for "Court 1"
    Then I should see the team names
    And I should see current player matchup with ranks "Player A (2 Dan) vs Player B (1 Dan)"
    And I should see current scores
    And I should see recent scoring actions
    And I should see which set is currently active (1-7)
    And I should see player ranks prominently displayed
    And the display should update in real-time
```

## Feature: Team and Dojo Management

### Scenario: View dojo team breakdown
```gherkin
Feature: Dojo and Team Management
  As a tournament participant
  I want to see my dojo's team structure
  So that I can understand our representation

  Scenario: View dojo teams and members
    Given I am logged in and belong to "Tokyo Kendo Club"
    When I navigate to the dashboard
    Then I should see all teams from "Tokyo Kendo Club"
    And I should see team members for each team sorted by highest rank first
    And I should see individual player ranks with proper badge styling
    And I should see team rankings if available
    And I should see which teams are still active in the tournament
    And the dojo member list should show "5 Dan" players before "2 Dan" players
    And "2 Dan" players should show before "1 Kyu" players
```

## Feature: Tournament History

### Scenario: View past tournament results
```gherkin
Feature: Tournament History
  As a tournament participant
  I want to view historical tournament results
  So that I can track performance over time

  Scenario: Access tournament archive
    Given there are completed tournaments
    When I navigate to tournament history
    Then I should see a list of past tournaments
    And I should be able to view results for each tournament
    And I should see participant rankings
    And I should see dojo performance statistics
```

## Feature: Mobile Responsiveness

### Scenario: Use app on mobile device
```gherkin
Feature: Mobile Experience
  As a mobile user
  I want to use the tournament app on my phone
  So that I can access information on the go

  Scenario: Navigate on mobile
    Given I am using a mobile device
    When I open the tournament app
    Then the interface should be responsive
    And navigation should be touch-friendly
    And text should be readable without zooming
    And buttons should be easily tappable
    And the bracket should be swipeable
```