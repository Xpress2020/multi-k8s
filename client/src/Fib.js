
import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: '',
    error: '',
  };

  // Automatically refresh data when the component loads
  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();

    // Refresh calculated values while the page is open
    this.polling = setInterval(() => {
      this.fetchValues();
      this.fetchIndexes();
    }, 2000);
  }

  // Stop polling when the component is removed
  componentWillUnmount() {
    clearInterval(this.polling);
  }

  // Fetch calculated Fibonacci values from the API
  fetchValues = async () => {
    try {
      const response = await axios.get('/api/values/current');
      this.setState({ values: response.data });
    } catch (error) {
      console.error('Error fetching calculated values:', error);
    }
  };

  // Fetch all submitted indexes
  fetchIndexes = async () => {
    try {
      const response = await axios.get('/api/values/all');
      this.setState({ seenIndexes: response.data });
    } catch (error) {
      console.error('Error fetching indexes:', error);
    }
  };

  // Submit an index to the backend
  handleSubmit = async (event) => {
    event.preventDefault();

    const index = this.state.index.trim();

    if (!/^\d+$/.test(index)) {
      this.setState({
        error: 'Please enter a valid non-negative integer.',
      });
      return;
    }

    if (Number(index) > 40) {
      this.setState({
        error: 'Please enter an index between 0 and 40.',
      });
      return;
    }

    try {
      this.setState({ error: '' });

      await axios.post('/api/values', { index });

      this.setState({ index: '' });

      // Refresh the lists immediately after submission
      await Promise.all([
        this.fetchIndexes(),
        this.fetchValues(),
      ]);
    } catch (error) {
      this.setState({
        error:
          error.response?.data ||
          'Unable to submit the index. Please try again.',
      });
      console.error('Error submitting index:', error);
    }
  };

  // Display submitted indexes
  renderSeenIndexes() {
    return this.state.seenIndexes
      .map(({ number }) => number)
      .join(', ');
  }

  // Display calculated values
  renderValues() {
    return Object.entries(this.state.values).map(([key, value]) => (
      <div key={key}>
        For index {key} I calculated {value}
      </div>
    ));
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="index-input">Enter your index:</label>

          <input
            id="index-input"
            type="number"
            min="0"
            max="40"
            step="1"
            value={this.state.index}
            onChange={(event) =>
              this.setState({
                index: event.target.value,
                error: '',
              })
            }
          />

          <button type="submit">Submit</button>
        </form>

        {this.state.error && (
          <p style={{ color: 'red' }}>{this.state.error}</p>
        )}

        <h3>Indexes I have seen:</h3>
        <div>{this.renderSeenIndexes()}</div>

        <h3>Calculated Values:</h3>
        <div>{this.renderValues()}</div>
      </div>
    );
  }
}

export default Fib;
